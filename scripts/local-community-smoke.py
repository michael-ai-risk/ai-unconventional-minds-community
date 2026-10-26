#!/usr/bin/env python3
"""Local Wrangler+D1 integration smoke; run via local-community-smoke.sh."""
import glob
import http.cookiejar
import json
import os
import urllib.error
import urllib.request
import uuid
from pathlib import Path

base = os.environ.get('COMMUNITY_TEST_URL', 'http://127.0.0.1:41523')
turnstile = 'XXXX.DUMMY.TOKEN.XXXX'

def local_secret(name):
    values = {}
    for line in Path('.dev.vars').read_text().splitlines():
        if '=' in line:
            key, value = line.split('=', 1)
            values[key] = value
    return values[name]

def call(path, method='GET', payload=None, token=None, key=None):
    data = None if payload is None else json.dumps(payload).encode()
    headers = {'Origin': base}
    if data is not None:
        headers['Content-Type'] = 'application/json'
    if token:
        headers['X-Content-Token'] = token
    if key:
        headers['X-Admin-Bootstrap-Key'] = key
    request = urllib.request.Request(base + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=12) as response:
            raw = response.read().decode()
            return response.status, json.loads(raw) if raw.startswith('{') else raw
    except urllib.error.HTTPError as error:
        raw = error.read().decode()
        try:
            body = json.loads(raw)
        except Exception:
            body = raw
        return error.code, body

def expect(name, actual, wanted):
    ok = actual == wanted
    print(('PASS' if ok else 'FAIL') + ' ' + name + ' actual=' + str(actual))
    if not ok:
        raise SystemExit(1)

uid = uuid.uuid4().hex[:10]
status, cats = call('/api/community/categories')
expect('public categories without session', status, 200)
status, events = call('/api/community/events')
expect('public events without session', status, 200)
expect('TBA seed event exists', len(events.get('events', [])) >= 1, True)
status, feed = call('/api/community/posts')
expect('public discussion feed', status, 200)
expect('feed does not disclose author email', 'email' not in str(feed), True)
status, signup = call('/api/auth/sign-up/email', 'POST', {'name': 'visitor', 'email': 'visitor@example.invalid', 'password': 'not-for-use-12345'})
expect('public signup disabled', status, 410)
status, guest_login = call('/api/auth/sign-in/email', 'POST', {'email': 'visitor@example.invalid', 'password': 'not-for-use-12345'})
expect('non-staff sign-in disabled', status, 401)

# Bootstrap a local-only staff account using the ignored dev secret.
admin_email = 'local-admin-' + uid + '@example.invalid'
admin_password = 'LocalOnly-Admin-' + uid + '-pass'
status, bootstrap = call('/api/admin/bootstrap', 'POST', {'email': admin_email, 'password': admin_password, 'name': 'Local Moderator'}, key=local_secret('ADMIN_BOOTSTRAP_SECRET'))
expect('one-time staff bootstrap', status, 201)
status, _ = call('/api/admin/bootstrap', 'POST', {'email': admin_email, 'password': admin_password, 'name': 'Local Moderator'}, key=local_secret('ADMIN_BOOTSTRAP_SECRET'))
expect('bootstrap cannot be repeated', status, 409)
staff_jar = http.cookiejar.CookieJar()
staff_browser = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(staff_jar))
login_data = json.dumps({'email': admin_email, 'password': admin_password}).encode()
login_request = urllib.request.Request(base + '/api/auth/sign-in/email', data=login_data, headers={'Origin': base, 'Content-Type': 'application/json'}, method='POST')
with staff_browser.open(login_request, timeout=12) as response:
    status = response.status
    login = json.loads(response.read().decode())
expect('staff can sign in', status, 200)
status, anonymous_queue = call('/api/community/admin/posts')
expect('anonymous visitor cannot access moderation queue', status, 401)

def admin_call(path, method='GET', payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    headers = {'Origin': base}
    if data is not None: headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(base + path, data=data, headers=headers, method=method)
    try:
        with staff_browser.open(req, timeout=12) as response:
            raw = response.read().decode()
            return response.status, json.loads(raw) if raw.startswith('{') else raw
    except urllib.error.HTTPError as error:
        raw = error.read().decode()
        try: body = json.loads(raw)
        except Exception: body = raw
        return error.code, body

status, invalid = call('/api/community/posts', 'POST', {'title': 'Bad captcha ' + uid, 'body': 'Must fail without a valid challenge.', 'category': 'general', 'turnstileToken': 'invalid-token'})
expect('invalid Turnstile rejected', status, 403)

status, created = call('/api/community/posts', 'POST', {
    'title': 'Guest post ' + uid,
    'body': 'No login, email, password, or real name was provided.',
    'category': 'general',
    'displayName': '',
    'turnstileToken': turnstile,
})
if status != 201 and status == 403:
    log = Path('/tmp/community-wrangler.log').read_text() if Path('/tmp/community-wrangler.log').exists() else ''
    if 'failed to lookup address information' in log:
        print('BLOCKED valid Turnstile verification: local Worker cannot resolve challenges.cloudflare.com')
        raise SystemExit(2)
expect('new visitor creates post without login', status, 201)
post_id, post_key = created['id'], created['editToken']
expect('unpredictable edit key returned once', len(post_key) >= 40, True)
status, hidden_feed = call('/api/community/posts?q=' + uid)
expect('unreviewed post excluded from public feed', len(hidden_feed.get('posts', [])), 0)
status, private_detail = call('/api/community/posts/' + post_id, token=post_key)
expect('author key reads own pending post', status, 200)
expect('pending state stored', private_detail['post']['status'], 'pending')
status, denied = call('/api/community/posts/' + post_id, 'PATCH', {'title': 'Unauthorized edit', 'body': 'No owner credential.'})
expect('visitor without owner key cannot edit', status, 403)
status, edited = call('/api/community/posts/' + post_id, 'PATCH', {'title': 'Edited guest post ' + uid, 'body': 'The private edit key authorizes this change.'}, token=post_key)
expect('owner key can edit own post', status, 200)

status, queue = admin_call('/api/community/admin/posts')
expect('staff can read moderation queue', status, 200)
expect('pending post appears in queue', any(row['id'] == post_id for row in queue.get('posts', [])), True)
status, changed = admin_call('/api/community/admin/posts/' + post_id, 'PATCH', {'status': 'visible'})
expect('staff approves post', status, 200)
status, public = call('/api/community/posts?q=' + uid)
expect('approved post persists after fresh anonymous read', len(public.get('posts', [])), 1)
expect('visitor nickname defaults to Guest', public['posts'][0]['author_name'], '访客 / Guest')

status, comment = call('/api/community/posts/' + post_id + '/comments', 'POST', {
    'body': 'Anonymous comment ' + uid,
    'displayName': 'Optional nickname',
    'turnstileToken': turnstile,
})
expect('visitor comments without login', status, 201)
comment_id, comment_key = comment['id'], comment['editToken']
status, pending_comments = admin_call('/api/community/admin/comments')
expect('comment enters review queue', any(row['id'] == comment_id for row in pending_comments.get('comments', [])), True)
status, deny_other = call('/api/community/comments/' + comment_id, 'PATCH', {'body': 'take over'})
expect('other visitor cannot edit comment', status, 403)
status, allow_owner = call('/api/community/comments/' + comment_id, 'PATCH', {'body': 'Edited anonymous comment ' + uid}, token=comment_key)
expect('comment owner key can edit', status, 200)
status, _ = admin_call('/api/community/admin/comments/' + comment_id, 'PATCH', {'status': 'visible'})
expect('staff approves comment', status, 200)
status, detail = call('/api/community/posts/' + post_id)
expect('anonymous reads persisted post detail', status, 200)
expect('approved comment persists', len(detail.get('comments', [])), 1)
expect('public detail omits email', 'email' not in str(detail), True)

status, report = call('/api/community/reports/post/' + post_id, 'POST', {'reason': 'Test anonymous report.'})
expect('visitor report does not require account', status, 201)
status, queue = admin_call('/api/community/admin/reports')
expect('report is visible to staff', any(row['target_id'] == post_id for row in queue.get('reports', [])), True)
status, method = admin_call('/api/community/admin/events/item', 'DELETE')
expect('unexpected admin method is rejected', status, 405)
status, missing = admin_call('/api/community/admin/articles/missing-id', 'PUT', {'slug': 'missing-article', 'titleZh': 'x', 'titleEn': 'x', 'summaryZh': '', 'summaryEn': '', 'bodyZh': '', 'bodyEn': '', 'published': True})
expect('update of absent article is not reported as success', status, 404)
oversized = {'title': 'Large payload ' + uid, 'body': 'x' * 9500, 'category': 'general', 'turnstileToken': turnstile}
status, _ = call('/api/community/posts', 'POST', oversized)
expect('oversized body rejected', status, 400)
status, hidden = admin_call('/api/community/admin/posts/' + post_id, 'PATCH', {'status': 'hidden'})
expect('staff can hide content', status, 200)
status, not_found = call('/api/community/posts/' + post_id)
expect('hidden post is not publicly readable', status, 404)
for attempt in range(11):
    status, _ = call('/api/community/posts', 'POST', {
        'title': 'Rate limit ' + uid,
        'body': 'Rate limit probe.',
        'category': 'general',
        'turnstileToken': 'invalid-token',
    })
expect('excessive post requests are rate-limited', status, 429)
print('SMOKE_OK')
