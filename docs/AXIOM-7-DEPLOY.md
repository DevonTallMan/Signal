# Deploying AXIOM-7

AXIOM-7 is the Cloudflare Worker that sits between Signal and Groq's
LLM API. The source code lives at `scripts/axiom-7-worker.js` in this
repo (not built by Astro). This doc tells you how to get it running
on Cloudflare.

## Deploy steps (dashboard path)

1. Open https://dash.cloudflare.com and sign in.
2. Left sidebar: **Workers & Pages**.
3. Find `msm-axiom-proxy` in the list. Click into it.
4. Top right: **Edit code**.
5. In the editor, replace the entire contents with the contents of
   `scripts/axiom-7-worker.js` from this repo. Copy-paste the whole
   file.
6. Click **Save and deploy**. Confirm.
7. Verify the secret `GROQ_API_KEY` is still set:
   - Back on the Worker's overview page, click **Settings**.
   - Scroll to **Variables and Secrets**.
   - Confirm `GROQ_API_KEY` is listed.
   - If missing, click **Add variable**, type **Secret**, name
     `GROQ_API_KEY`, paste the key value, save.

## Testing the deploy

From a terminal with curl:

```bash
curl -X POST https://msm-axiom-proxy.morrischristopher675.workers.dev/mark \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": "test",
    "questionId": "test-001",
    "scenario": "A warehouse needs to track 10000 products.",
    "question": "Name one suitable data structure.",
    "maxMarks": 4,
    "markScheme": {
      "nameExpected": "An array of records.",
      "explainExpected": "Array holds many records indexed by position.",
      "impactExpected": "Enables bulk operations across all items."
    },
    "answer": "You should use an array of records because it lets you store all the items in one structure."
  }'
```

Expected output: JSON with a `text` field containing the marking in
MARKS/NAME/EXPLAIN/IMPACT/VERDICT format.

If you get 502, check `GROQ_API_KEY` is set correctly.

If the browser shows CORS errors (but curl works), add the deploying
domain to `ALLOWED_ORIGINS` in `scripts/axiom-7-worker.js` and
re-deploy.

## Source of truth

The Worker source in Cloudflare's dashboard is the source of truth.
`scripts/axiom-7-worker.js` in this repo is a mirror we keep for
code review, version history, and restore-from-git. When you change
the prompt, update this file AND deploy. Do not let them diverge.
