# API Design

## Authentication

### POST /auth/signup

Creates a new user account.


### POST /auth/login

Authenticates existing user.


### GET /auth/me

Returns current user profile.



---

# Interviews

## POST /interviews

Creates an interview session.

Request:

```json
{
  "role": "Machine Learning Engineer",
  "experience": "Intermediate",
  "difficulty": "Medium",
  "type": "Technical"
}
```

---

## GET /interviews

Returns user interview history.


---

## GET /interviews/{id}

Returns interview details.


---

# Sessions

## GET /sessions/{id}/question

Returns next interview question.


---

## POST /sessions/{id}/answer

Submits candidate response for analysis.


---

# Reports

## GET /reports/{interview_id}

Returns generated AI analysis report.
