#!/usr/bin/env python3
"""Local-only Wrangler+D1 integration smoke. Start the preview Worker on port 40233 first."""
import glob
import http.cookiejar
import json
import sqlite3
import urllib.error
import urllib.request
import uuid
base = 'http://127.0.0.1:40233'

def client():
    jar=http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
def call(opener, path, method='GET', payload=None):
    data=None if payload is None else json.dumps(payload).encode()
    headers={'Origin':base}
    if data is not None: headers['Content-Type']='application/json'
    req=urllib.request.Request(base+path,data=data,headers=headers,method=method)
    try:
        with opener.open(req,timeout=4) as r:
            raw=r.read().decode(); return r.status, json.loads(raw) if raw.startswith('{') else raw
    except urllib.error.HTTPError as e:
        raw=e.read().decode();
        try: body=json.loads(raw)
        except: body=raw
        return e.code,body

def expect(name,actual,wanted):
    ok=actual==wanted
    print(('PASS' if ok else 'FAIL')+' '+name+' actual='+str(actual))
    if not ok: raise SystemExit(1)

anon=client(); status, cats=call(anon,'/api/community/categories'); expect('category API',status,200)
status, ev=call(anon,'/api/community/events'); expect('public event API',status,200)
expect('seed event exists',len(ev.get('events',[]))>=1,True)
status,posts=call(anon,'/api/community/posts'); expect('empty public post feed',status,200)
uid=uuid.uuid4().hex[:10]
a=client(); b=client()
status,res=call(a,'/api/auth/sign-up/email','POST',{'name':'Test member A','email':'member-a-'+uid+'@example.invalid','password':'UnusualPassphrase-123'})
expect('member A registration',status,200)
status,session=call(a,'/api/auth/get-session'); expect('member A session',status,200)
status,profile=call(a,'/api/community/profile'); expect('private self profile read',status,200)
admin_id=session['user']['id']
expect('profile response omits email', 'email' not in profile.get('profile',{}), True)
status,notstaff=call(a,'/api/community/admin/reports'); expect('ordinary member denied staff queue',status,403)
status,res=call(b,'/api/auth/sign-up/email','POST',{'name':'Test member B','email':'member-b-'+uid+'@example.invalid','password':'UnusualPassphrase-456'})
expect('member B registration',status,200)
status,res=call(a,'/api/community/posts','POST',{'title':'Persistent test post '+uid,'body':'Test content survives reload.','category':'general'})
expect('authenticated post creation',status,201); pid=res['id']
status,feed=call(anon,'/api/community/posts?q='+uid); expect('public post visible after fresh request',status,200)
expect('fresh request reads saved post',len(feed.get('posts',[]))==1,True)
status,comment=call(b,'/api/community/posts/'+pid+'/comments','POST',{'body':'A reply from another signed-in member.'}); expect('second account comment',status,201)
status,edited=call(b,'/api/community/comments/'+comment['id'],'PATCH',{'body':'Edited reply by its author.'}); expect('author can edit own comment',status,200)
status,report=call(b,'/api/community/reports/post/'+pid,'POST',{'reason':'Test report for moderation workflow.'}); expect('member can submit report',status,201)
db_files=[f for f in glob.glob('dist/server/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite') if not f.endswith('metadata.sqlite')]
assert db_files, 'local D1 test database not found'
with sqlite3.connect(db_files[0]) as db: db.execute("INSERT INTO roles(user_id,role) VALUES(?, 'admin')", (admin_id,))
status,queue=call(a,'/api/community/admin/reports'); expect('administrator can read report queue',status,200)
expect('submitted report appears in admin queue',len(queue.get('reports',[]))>=1,True)
status,result=call(a,'/api/community/admin/events','POST',{'slug':'smoke-event-'+uid,'titleZh':'测试活动','titleEn':'Test event','summaryZh':'本地验证','summaryEn':'Local verification','bodyZh':'活动时间地点未确认','bodyEn':'Date and venue are unconfirmed','status':'tba','published':True}); expect('admin creates honest TBA event',status,201)
status,listed=call(anon,'/api/community/events/smoke-event-'+uid); expect('published event detail survives fresh request',status,200)
status,result=call(a,'/api/community/admin/articles','POST',{'slug':'smoke-topic-'+uid,'titleZh':'测试AI话题','titleEn':'Test AI topic','summaryZh':'本地验证','summaryEn':'Local verification','bodyZh':'编辑内容','bodyEn':'Editorial content','published':True}); expect('admin publishes bilingual article',status,201)
status,listed=call(anon,'/api/community/articles/smoke-topic-'+uid); expect('published article detail survives fresh request',status,200)
status,detail=call(anon,'/api/community/posts/'+pid); expect('anonymous can read post and reply',status,200)
expect('comment appears after fresh request',len(detail.get('comments',[]))==1,True)
expect('private author email is not returned', 'email' not in detail.get('post',{}), True)
status,denied=call(b,'/api/community/posts/'+pid,'PATCH',{'title':'stolen content','body':'should not update'})
expect('other member cannot edit post',status,404)
status,protected=call(anon,'/api/community/posts','POST',{'title':'Unauthorized post','body':'no session','category':'general'})
expect('anonymous write blocked',status,401)
status,result=call(a,'/api/community/admin/reports/'+queue['reports'][0]['id'],'PATCH',{'status':'resolved'}); expect('admin resolves report',status,200)
status,result=call(a,'/api/community/admin/posts/'+pid,'PATCH',{'status':'hidden'}); expect('admin hides reported post',status,200)
status,result=call(anon,'/api/community/posts/'+pid); expect('hidden post excluded from public feed',status,404)
print('SMOKE_OK')
