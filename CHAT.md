## Groq API usage
```
curl https://api.groq.com/openai/v1/chat/completions -s \
-H "Content-Type: application/json" \
-H "Authorization: Bearer xxxx" \
-d '{
"model": "openai/gpt-oss-120b",
"messages": [{
    "role": "user",
    "content": "Hello. How is the weather today?"
}]
}'
```