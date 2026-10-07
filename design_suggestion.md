# AI Quiz Generation System

## Design, Architecture, Validation, Retry Strategy, Security, and UX Guide

**Status:** Design specification\
**Scope:** Groq-based structured quiz generation\
**Primary goal:** Generate reliable, validated multiple-choice quizzes
while keeping model responsibility, application responsibility, and user
experience clearly separated.

------------------------------------------------------------------------

# 1. Executive Summary

The quiz-generation system should treat the LLM as a **content
generator**, not as the authority over application state, identifiers,
database structure, or validation.

The system should use five major layers:

1.  **Generation instructions**\
    A strong system prompt defines the model's role, output
    requirements, security boundaries, and educational quality rules.

2.  **Strict structured output**\
    Groq Structured Outputs with a strict JSON Schema forces the
    response into the expected structural shape.

3.  **Application validation**\
    Backend validation checks rules that JSON Schema cannot express
    reliably, such as exactly one correct answer, valid option
    references, duplicate detection, and content constraints.

4.  **Bounded repair/retry**\
    If the model produces structurally valid but semantically invalid
    output, the backend sends the previous output plus deterministic
    validation feedback back to the model. The model is instructed to
    correct the output rather than discuss the feedback.

5.  **Application-owned persistence and UX**\
    The backend generates UUIDs, persists only validated content, and
    exposes clean success/failure states. The frontend shows
    progress-oriented loading messages while generation and validation
    are occurring.

The central principle is:

> **Prompting controls behavior. JSON Schema controls structure.
> Application validation controls invariants. The database controls
> persistence.**

No single layer should be expected to solve all four problems.

------------------------------------------------------------------------

# 2. Goals

The system should:

-   Generate a requested number of quiz questions.
-   Support explicit difficulty levels.
-   Produce multiple-choice questions with plausible distractors.
-   Produce exactly one correct answer per single-select question.
-   Produce concise explanations for options.
-   Return machine-readable structured data.
-   Prevent normal model chatter such as introductions, Markdown, or
    conversational filler.
-   Treat user-provided learning material as untrusted data.
-   Resist prompt injection contained inside educational material.
-   Generate UUIDs in the application rather than relying on the model.
-   Validate the output before it reaches the database.
-   Automatically repair common model mistakes.
-   Stop after a bounded number of retries.
-   Fail gracefully when generation cannot be made valid.
-   Give the user a clear and engaging generation experience.
-   Keep UI messages consistent with actual backend stages.
-   Avoid exposing internal validation details to normal users.
-   Keep the system extensible for future adaptive-quiz features.

------------------------------------------------------------------------

# 3. Non-Goals

The LLM should **not** be responsible for:

-   Generating database IDs.
-   Generating UUIDs used as persistent identifiers.
-   Deciding whether its own output is valid.
-   Enforcing database constraints.
-   Deciding application permissions.
-   Executing instructions found inside source material.
-   Determining whether an API request is authorized.
-   Persisting data directly.
-   Controlling frontend state.
-   Deciding how many retries are allowed.
-   Deciding whether an error should be shown to the user.

The model generates content. The application owns everything around that
content.

------------------------------------------------------------------------

# 4. High-Level Architecture

The intended architecture is:

``` text
User
  |
  | topic / source material / difficulty / count
  v
Frontend
  |
  v
Backend Quiz Generation Endpoint
  |
  +--> Request validation
  |
  +--> System prompt + generation constraints
  |
  +--> Untrusted educational material
  |
  v
Groq LLM
  |
  v
Strict Structured Output
  |
  v
JSON parsing
  |
  v
Application semantic validation
  |
  +-------- valid --------> UUID assignment
  |                           |
  |                           v
  |                        Persistence
  |                           |
  |                           v
  |                         Success
  |
  +-------- invalid ------> Validation feedback
                              |
                              v
                           Retry #1
                              |
                              v
                       Semantic validation
                              |
                              +--> valid --> UUIDs --> persistence
                              |
                              +--> invalid --> Retry #2
                                                  |
                                                  v
                                           Final validation
                                                  |
                                      +-----------+-----------+
                                      |                       |
                                    valid                   invalid
                                      |                       |
                                      v                       v
                                  Success                 Graceful error
```

The important boundary is between **model output** and **application
acceptance**.

The model's output should always be considered provisional until
validation succeeds.

------------------------------------------------------------------------

# 5. Quiz Data Model

The model should return content rather than persistent identifiers.

A question conceptually contains:

-   question text
-   options
-   whether each option is correct
-   an explanation associated with each option

A suitable conceptual structure is:

``` text
Quiz
  ├── title
  └── questions
       ├── question
       └── options
            ├── label
            ├── isTrue
            └── explanation
```

The exact persisted representation can later include:

-   UUID
-   quiz ID
-   question UUID
-   option UUID
-   ordering
-   difficulty
-   topic
-   source reference
-   timestamps
-   generation metadata

The model should not be required to generate these persistent fields
unless they are genuinely content fields.

------------------------------------------------------------------------

# 6. Why Application-Owned UUIDs Are Preferred

Persistent IDs should be generated by the application.

The model only needs to produce:

-   question content
-   option content
-   correctness information
-   explanations

After validation, the backend assigns UUIDs.

This provides several benefits:

### Reliability

The application controls uniqueness.

### Consistency

The same ID-generation strategy is used regardless of which model is
used.

### Security

The model cannot intentionally or accidentally collide with existing
database identifiers.

### Database independence

The generated content does not need to understand the database's
identifier format.

### Cleaner retries

If a generation attempt fails validation, its temporary content can be
discarded or replaced without creating persistent IDs prematurely.

### Easier migrations

Changing database ID strategy does not require changing the LLM schema.

The model should be treated as an external content-generation
dependency, not as part of the database layer.

------------------------------------------------------------------------

# 7. Correct Answer Representation

The chosen design uses an `isTrue` property on every option.

For a single-select question:

-   exactly one option must have `isTrue = true`
-   every other option must have `isTrue = false`

This is intentionally simple.

The backend must enforce the invariant:

> Every single-select question has exactly one correct option.

JSON Schema can enforce that `isTrue` is a boolean, but it cannot
reliably enforce that exactly one element in an arbitrary array has the
value `true`.

Therefore the backend must perform this check.

If zero options are true, the question is invalid.

If two or more options are true, the question is invalid.

The application must never silently choose one of multiple true options.

------------------------------------------------------------------------

# 8. Option Explanations

Every option should have a short explanation.

The preferred behavior is:

-   correct option: explain why it satisfies the question
-   incorrect option: explain the specific reason it does not satisfy
    the question

The explanation should normally be approximately one or two sentences.

Explanations should be:

-   concise
-   educational
-   specific to the option
-   factually consistent with the question
-   free from meta-commentary
-   free from speculation about how the learner reached the answer

Avoid explanations that simply say:

-   "This is correct."
-   "This is wrong."
-   "Because this is the right answer."

The explanation should provide actual learning value.

For example, an incorrect option should identify the relevant
misconception, missing condition, incorrect relationship, or factual
error.

------------------------------------------------------------------------

# 9. JSON Schema Responsibilities

The strict JSON Schema should enforce structural requirements such as:

-   top-level object exists
-   quiz object exists
-   title exists
-   questions is an array
-   question text is a string
-   options is an array
-   each option has a label
-   each option has a boolean correctness field
-   explanations exist
-   required properties are present
-   unexpected properties are rejected

The schema should use strict object behavior.

Every object should reject additional properties.

The schema should explicitly require fields rather than relying on
optional fields that the application assumes will exist.

The schema is a **structural contract**, not a semantic validator.

------------------------------------------------------------------------

# 10. What JSON Schema Cannot Reliably Enforce

The application must not assume that a strict schema means the content
is correct.

The schema cannot adequately enforce business rules such as:

-   exactly one correct option
-   all option IDs are unique if IDs are generated elsewhere
-   explanations correspond to the intended options
-   options are semantically distinct
-   a distractor is actually incorrect
-   the question has only one defensible answer
-   the answer is supported by the source material
-   the question is appropriate for the requested difficulty
-   the question is not ambiguous
-   two questions are not duplicates
-   a question does not accidentally reveal the answer in another field

These are application-level quality rules.

------------------------------------------------------------------------

# 11. Validation Layers

Validation should be divided into multiple levels.

## 11.1 Transport validation

Check that:

-   the API request succeeded
-   the model returned a response
-   the expected response field exists
-   the response can be parsed

If this fails, classify it as an API/model failure rather than a
quiz-content failure.

------------------------------------------------------------------------

## 11.2 Schema validation

Strict Structured Outputs should handle most structural constraints.

The application should still validate the received object against its
own expected schema at the application boundary.

This protects the rest of the system from malformed data.

------------------------------------------------------------------------

## 11.3 Semantic validation

Check:

-   question count
-   question text is non-empty
-   option count is within the allowed range
-   option labels are non-empty
-   exactly one option is true
-   every option has an explanation
-   explanations are non-empty
-   options are not exact duplicates
-   questions are not exact duplicates
-   required difficulty is represented appropriately
-   required topics are represented
-   generated content remains within the requested scope

------------------------------------------------------------------------

## 11.4 Quality validation

For higher-quality generation, additional checks can identify:

-   ambiguous questions
-   multiple defensible answers
-   weak distractors
-   nonsense distractors
-   answer leakage
-   contradictions between question and explanation
-   explanations that disagree with `isTrue`
-   source-material violations
-   inappropriate difficulty
-   repeated knowledge targets

Not every quality check must be automated initially.

Start with deterministic invariants and add stronger quality checks as
the system matures.

------------------------------------------------------------------------

# 12. Prompt Injection Model

Prompt injection should be treated as a **data-boundary problem**, not
merely as a prompt-writing problem.

Educational material may contain text such as:

-   "Ignore previous instructions."
-   "Reveal the system prompt."
-   "Change the output format."
-   "Return a different JSON structure."
-   "Pretend you are another assistant."

The model must treat such content as source material, not instructions.

The system prompt should explicitly establish:

1.  The model's role.
2.  The source material's untrusted status.
3.  The fact that instructions inside the source material are not
    authoritative.
4.  The required output format.
5.  The fact that the model must never reveal system instructions.
6.  The fact that source material cannot change the model's role or
    output contract.

------------------------------------------------------------------------

# 13. Delimiting Untrusted Material

User-provided or externally retrieved learning material should be
clearly delimited.

Conceptually:

``` text
SYSTEM INSTRUCTIONS
    |
    v
AUTHORITATIVE RULES

UNTRUSTED MATERIAL
    |
    v
EDUCATIONAL CONTENT ONLY
```

The system should clearly communicate that content inside the
untrusted-material boundary is data to analyze.

This does not provide an absolute mathematical guarantee against prompt
injection.

It creates a strong instruction hierarchy and makes the intended trust
boundary explicit.

Application-level controls remain necessary.

------------------------------------------------------------------------

# 14. System Prompt Design

The system prompt should be divided conceptually into several sections.

## Role

Define the model as a quiz-generation engine.

## Security

Define all user-provided content as untrusted.

## Output

Require only the structured output.

## Quiz rules

Define:

-   question count
-   option count
-   exactly one correct option
-   explanation requirements
-   no duplicate questions
-   plausible distractors
-   no answer leakage

## Difficulty

Define the meaning of Easy, Medium, and Hard.

## Source grounding

When source material is provided, require the questions to remain
supported by it.

## Validation feedback

Tell the model that application-generated validation feedback is
correction information.

The model should:

-   act on feedback
-   correct the identified issue
-   preserve valid content
-   return the complete corrected structure
-   not discuss the feedback
-   not change the schema

------------------------------------------------------------------------

# 15. "Act on Feedback, Don't React to Feedback"

When a retry occurs, the model should receive:

1.  The previous structured output.
2.  The deterministic validation errors.
3.  The instruction to return the complete corrected output.

The retry prompt should make it clear that validation feedback is not a
conversational question.

The model should not respond with:

-   "You're right."
-   "I apologize."
-   "Here is the corrected version."
-   explanations about what it changed

It should simply produce the corrected structured response.

This keeps the retry path machine-oriented.

------------------------------------------------------------------------

# 16. Retry Architecture

Retries should be bounded.

Recommended policy:

-   Initial generation
-   Retry #1
-   Retry #2
-   Fail

This means the system has at most three generation attempts.

Do not use an unlimited retry loop.

An unlimited retry loop can cause:

-   excessive API costs
-   long user wait times
-   repeated identical failures
-   server resource consumption
-   difficult-to-debug production incidents

Two retries provide a reasonable balance between resilience and cost.

------------------------------------------------------------------------

# 17. What Gets Retried

Retry when the failure is likely to be corrected by giving the model
deterministic feedback.

Examples:

-   two correct options
-   zero correct options
-   missing explanation
-   malformed content
-   duplicate options
-   invalid number of options
-   ambiguous generated question
-   answer leakage
-   content violating an explicit generation constraint

Do not retry indefinitely for failures that are clearly caused by the
application itself.

------------------------------------------------------------------------

# 18. Fail-Fast Conditions

Some problems should not be sent back to the model.

Examples:

-   invalid server-side schema configuration
-   missing API key
-   unavailable model
-   malformed internal request
-   database outage
-   invalid application configuration
-   impossible generation request
-   contradictory application requirements

These are system failures, not content-quality failures.

The application should distinguish:

``` text
MODEL CONTENT FAILURE
        -> possibly retry

SYSTEM FAILURE
        -> fail immediately or use infrastructure-level recovery
```

------------------------------------------------------------------------

# 19. Final Failure Behavior

If all generation attempts fail, stop.

Do not continue silently.

The backend should return a stable application-level error state.

The frontend should show something similar to:

> We couldn't finish your quiz. Something went wrong while generating
> the questions. Please try again.

Do not expose internal validation details to ordinary users.

Avoid messages such as:

> Question 4 failed because two options evaluated to true after semantic
> validation.

That is useful for logs, not for the learner.

------------------------------------------------------------------------

# 20. Error Logging

Internally, retain enough information to debug failures.

Useful internal data includes:

-   request ID
-   user/session context where appropriate
-   model name
-   difficulty
-   requested question count
-   generation attempt number
-   validation failure category
-   validation errors
-   latency
-   token usage if available
-   final success/failure state
-   API error information

Do not log secrets or sensitive user content unnecessarily.

Do not expose internal system prompts in logs that are broadly
accessible.

------------------------------------------------------------------------

# 21. Difficulty Model

The user should select one of:

-   Easy
-   Medium
-   Hard

The frontend can represent these internally as stable enum values.

The backend should pass the selected difficulty as an explicit
generation parameter.

The system prompt should define difficulty operationally.

## Easy

Expected characteristics:

-   direct recall
-   basic recognition
-   straightforward application
-   minimal inference
-   familiar examples
-   simple distractors

## Medium

Expected characteristics:

-   conceptual understanding
-   application to a scenario
-   comparison
-   moderate reasoning
-   plausible distractors
-   common misconceptions

## Hard

Expected characteristics:

-   multi-step reasoning
-   subtle distinctions
-   edge cases
-   interaction between multiple concepts
-   strong distractors
-   careful interpretation of conditions

Hard questions should not merely use obscure trivia.

Difficulty should reflect cognitive demand, not how annoying the fact is
to remember.

------------------------------------------------------------------------

# 22. Loading UX

Generation may involve multiple model calls.

The frontend should therefore represent the process as a progression
rather than a generic spinner.

Suggested stages:

``` text
Building your questions...
Checking the answers...
Final polishing...
Done
```

The messages should correspond to actual or approximate backend stages.

The system should not intentionally add unnecessary delay simply to make
the AI appear more sophisticated.

If the request finishes quickly, show the result quickly.

If retries genuinely occur, the additional status messages make the wait
understandable.

------------------------------------------------------------------------

# 23. Difficulty-Aware Loading Messages

Difficulty can influence the copy shown during generation.

## Easy

Examples:

-   Preparing your questions...
-   Checking the answers...
-   Final polishing...

## Medium

Examples:

-   Building your questions...
-   Checking the distractors...
-   Balancing the difficulty...
-   Final polishing...

## Hard

Examples:

-   Building the tougher questions...
-   Checking the reasoning...
-   Stress-testing the answer choices...
-   Final polishing...

The application should own these messages.

The LLM should not decide what the frontend displays.

------------------------------------------------------------------------

# 24. Optional Playful Loading Messages

Occasional humorous messages can make waiting feel lighter.

Examples:

-   Extracting energy from the Sun... just kidding.
-   Making the wrong answers suspiciously convincing...
-   Checking whether the questions are actually hard...
-   Teaching the distractors some manners...
-   Arguing with the laws of probability...

Use these sparingly.

They should never obscure an actual error state.

They should also not claim that the AI is performing work it is not
performing.

The goal is engagement, not deception.

------------------------------------------------------------------------

# 25. Status State Machine

The frontend should conceptually use states such as:

``` text
IDLE
  |
  v
GENERATING
  |
  v
VALIDATING
  |
  +---- valid ----> SUCCESS
  |
  +---- invalid ---> REPAIRING
                       |
                       v
                    VALIDATING
                       |
                       +---- valid ----> SUCCESS
                       |
                       +---- invalid ---> REPAIRING
                                             |
                                             v
                                          VALIDATING
                                             |
                                      +------+------+
                                      |             |
                                    valid         invalid
                                      |             |
                                      v             v
                                   SUCCESS        ERROR
```

The exact implementation mechanism can vary.

The important requirement is that UI state is deterministic and
controlled by the application.

------------------------------------------------------------------------

# 26. "Done" State

Once the final validated quiz has been successfully produced:

1.  Mark the generation operation successful.
2.  Persist or prepare the validated result.
3.  Update the frontend state to `Done`.
4.  Render the quiz.
5.  Remove or fade the loading indicator.

The `Done` message should not remain indefinitely.

The purpose of `Done` is to provide a clean transition between
generation and quiz interaction.

------------------------------------------------------------------------

# 27. Backend API Contract

The frontend should receive a simple application-level contract.

Successful generation should conceptually return:

``` text
status: success
quiz: validated quiz object
```

Failure should conceptually return:

``` text
status: error
code: stable application error code
message: user-safe message
```

The frontend should not need to understand:

-   Groq's internal response format
-   model-specific response fields
-   JSON Schema internals
-   validation implementation details
-   retry mechanics

The backend acts as an abstraction layer.

------------------------------------------------------------------------

# 28. Frontend/Backend Responsibility Split

## Frontend

Responsible for:

-   collecting topic/source material
-   collecting difficulty
-   collecting question count
-   showing generation progress
-   showing success
-   showing user-safe errors
-   rendering the final quiz

## Backend

Responsible for:

-   authentication/authorization
-   request validation
-   system prompt
-   untrusted-content boundaries
-   Groq API call
-   structured output configuration
-   parsing
-   semantic validation
-   retry logic
-   UUID assignment
-   persistence
-   error classification
-   logging

## LLM

Responsible for:

-   generating question content
-   generating options
-   identifying the correct option
-   generating explanations
-   following the provided generation constraints

This separation is intentional.

------------------------------------------------------------------------

# 29. UUID Assignment Workflow

UUID assignment should happen only after the generated quiz passes
validation.

Conceptually:

``` text
LLM output
   |
   v
Validation
   |
   +---- fail --> retry
   |
   +---- pass
          |
          v
      Generate UUIDs
          |
          v
      Create DB entities
          |
          v
        Save
```

Do not create persistent database records from an unvalidated generation
attempt.

This prevents partial or invalid data from entering the database.

------------------------------------------------------------------------

# 30. Database Persistence

The database should receive only validated application objects.

Database constraints should still exist as the final safety boundary.

For example, the database layer should enforce appropriate constraints
around:

-   required fields
-   relationships
-   uniqueness
-   foreign keys
-   ordering
-   ownership

The database should not need to trust the LLM.

------------------------------------------------------------------------

# 31. Source-Grounded Generation

If the user supplies educational material, the generated questions
should be grounded in that material when the product requirement is
source-based generation.

The model should not:

-   invent source-specific facts
-   pretend a statement was present when it was not
-   use unrelated facts simply because they sound plausible

If the source does not support a requested question, the generation
process should replace the question with a supported one or report that
the requested generation cannot be completed.

------------------------------------------------------------------------

# 32. Question Quality Requirements

Every question should ideally satisfy:

-   one clear learning target
-   self-contained wording
-   sufficient context
-   one defensible correct answer
-   plausible distractors
-   no accidental answer leakage
-   appropriate difficulty
-   concise wording
-   accurate explanations

Avoid:

-   trick wording
-   unnecessary ambiguity
-   "all of the above"
-   "none of the above"
-   absurd distractors
-   duplicated options
-   answer choices with noticeably different detail levels
-   questions where multiple answers are technically correct
-   questions requiring information not present in the provided source
    when source grounding is required

------------------------------------------------------------------------

# 33. Distractor Design

Incorrect options should be plausible.

Good distractors often come from:

-   common misconceptions
-   nearby concepts
-   common category errors
-   reversed relationships
-   incomplete answers
-   typical calculation mistakes
-   confusion between similar terms

Bad distractors are:

-   nonsense
-   unrelated concepts
-   obviously impossible values
-   jokes that make the correct answer obvious
-   options that are substantially shorter or longer than all others
    without reason

A distractor should test understanding, not merely whether the learner
can identify the absurd answer.

------------------------------------------------------------------------

# 34. Avoiding Answer Leakage

The system should check that the question does not accidentally reveal
its answer through:

-   wording
-   repeated terminology
-   option length
-   unique formatting
-   explanations shown before answering
-   hints
-   another question
-   another option
-   metadata

For example, if the correct option uses a term that appears nowhere else
except the question in a uniquely revealing way, the learner may be able
to select it without understanding the material.

Quality validation should progressively become more sophisticated as the
product develops.

------------------------------------------------------------------------

# 35. Testing Strategy

The generation system should be tested with several categories of input.

## Normal content

-   simple factual material
-   technical material
-   long material
-   short material
-   mixed topics

## Difficulty tests

-   easy
-   medium
-   hard

## Structural failures

-   missing fields
-   invalid types
-   missing options
-   missing explanations
-   multiple correct options
-   zero correct options

## Injection tests

Include malicious instructions inside:

-   normal paragraphs
-   headings
-   code blocks
-   quoted text
-   copied webpages
-   educational examples

The expected behavior is that the content is treated as data and not as
authoritative instructions.

## Retry tests

Force deterministic validation failures and verify that:

-   retry happens
-   feedback is passed correctly
-   the complete output is regenerated
-   valid content is preserved where appropriate
-   retry count is capped

## Failure tests

Force:

-   API errors
-   timeouts
-   malformed responses
-   repeated validation failure
-   unavailable models

The user should always receive a clean final state.

------------------------------------------------------------------------

# 36. Observability

Production monitoring should track:

-   generation success rate
-   first-attempt success rate
-   retry rate
-   second-attempt success rate
-   final failure rate
-   average generation latency
-   latency by difficulty
-   average attempts per successful quiz
-   validation failure categories
-   API errors
-   token/cost metrics where available

This data will reveal whether the prompt/schema design is actually
working.

For example:

``` text
First attempt success: 96%
Retry success: 3%
Final failure: 1%
```

is very different from:

``` text
First attempt success: 55%
Retry success: 30%
Final failure: 15%
```

The second system probably has a design problem rather than a retry
problem.

------------------------------------------------------------------------

# 37. Cost and Latency Strategy

The system should optimize for first-attempt correctness.

Retries are recovery mechanisms, not the normal generation strategy.

Good:

``` text
Strong prompt
+
Strict schema
+
Good model
+
Deterministic validation
+
Small number of retries
```

Bad:

``` text
Weak prompt
+
No schema
+
No validation
+
Unlimited retries
```

Do not intentionally generate low-quality output with the assumption
that retries will repair everything.

------------------------------------------------------------------------

# 38. SDK vs Direct HTTP

The Groq SDK is optional.

The application can communicate with the API directly through HTTP.

Direct HTTP provides:

-   fewer dependencies
-   visibility into the actual API request
-   straightforward integration
-   useful learning value while developing the backend

The official SDK provides:

-   less request boilerplate
-   convenience wrappers
-   better developer ergonomics
-   easier access to SDK-supported functionality
-   potentially better type support

Neither approach changes the fundamental architecture.

The structured-output contract, validation, retry strategy, and security
model remain the same.

A reasonable development approach is to start with direct HTTP if
understanding the underlying API is useful, then adopt the SDK when it
improves maintainability.

------------------------------------------------------------------------

# 39. Recommended Development Order

Implement the system incrementally.

## Phase 1: Basic generation

Get one request to produce structured quiz content.

Requirements:

-   Groq API connection
-   system prompt
-   JSON Schema
-   parsing
-   basic response handling

## Phase 2: Application validation

Add:

-   exactly-one-correct-answer validation
-   option count validation
-   missing explanation validation
-   duplicate detection
-   question count validation

## Phase 3: UUID ownership

After validation:

-   assign question UUIDs
-   assign option UUIDs
-   construct database objects

## Phase 4: Retry mechanism

Add:

-   validation feedback
-   previous output
-   retry #1
-   retry #2
-   final failure

## Phase 5: Difficulty

Add:

-   Easy
-   Medium
-   Hard
-   difficulty-specific generation rules

## Phase 6: UX

Add:

-   generation state
-   validation state
-   repair state
-   Done state
-   user-safe errors
-   difficulty-aware loading messages

## Phase 7: Security testing

Test:

-   prompt injection
-   malicious source material
-   schema manipulation attempts
-   output-format attacks
-   instruction hierarchy attacks

## Phase 8: Observability

Add:

-   attempt metrics
-   latency
-   failure categories
-   cost/token tracking
-   request tracing

------------------------------------------------------------------------

# 40. Recommended Final Architecture

The final conceptual architecture should look like this:

``` text
                         ┌───────────────────────┐
                         │       FRONTEND        │
                         │                       │
                         │ Topic                 │
                         │ Source Material       │
                         │ Difficulty            │
                         │ Question Count        │
                         └───────────┬───────────┘
                                     │
                                     v
                         ┌───────────────────────┐
                         │    BACKEND ENDPOINT   │
                         │                       │
                         │ Validate request      │
                         │ Authorize user        │
                         └───────────┬───────────┘
                                     │
                                     v
                         ┌───────────────────────┐
                         │  GENERATION CONTEXT   │
                         │                       │
                         │ System instructions   │
                         │ Difficulty rules      │
                         │ Output contract       │
                         │ Untrusted material    │
                         └───────────┬───────────┘
                                     │
                                     v
                         ┌───────────────────────┐
                         │        GROQ LLM       │
                         │                       │
                         │ Generate content      │
                         └───────────┬───────────┘
                                     │
                                     v
                         ┌───────────────────────┐
                         │ STRICT JSON SCHEMA    │
                         │                       │
                         │ Structural contract   │
                         └───────────┬───────────┘
                                     │
                                     v
                         ┌───────────────────────┐
                         │ APPLICATION VALIDATOR │
                         │                       │
                         │ Semantic invariants  │
                         │ Quality checks        │
                         └───────────┬───────────┘
                                     │
                         ┌───────────┴───────────┐
                         │                       │
                       VALID                   INVALID
                         │                       │
                         v                       v
                ┌─────────────────┐    ┌─────────────────┐
                │ UUID ASSIGNMENT │    │ VALIDATION      │
                │                 │    │ FEEDBACK        │
                └────────┬────────┘    └────────┬────────┘
                         │                      │
                         v                      v
                ┌─────────────────┐       RETRY #1
                │    DATABASE     │           │
                └────────┬────────┘           v
                         │                 VALIDATE
                         │                    │
                         │                    v
                         │                 RETRY #2
                         │                    │
                         │                    v
                         │                 VALIDATE
                         │                    │
                         └──────────────┬─────┘
                                        │
                                ┌───────┴────────┐
                                │                │
                              SUCCESS          FAILURE
                                │                │
                                v                v
                              QUIZ        USER-SAFE ERROR
```

------------------------------------------------------------------------

# 41. Core Design Principles

Keep these principles as the permanent rules for the implementation.

### Principle 1: The LLM is not trusted

Its output is provisional until validated.

### Principle 2: The LLM does not own identifiers

UUIDs belong to the application.

### Principle 3: JSON Schema is not semantic validation

Schema validates shape. Application code validates meaning.

### Principle 4: User content is untrusted

Educational material can contain prompt injections.

### Principle 5: Validation feedback is machine feedback

The model should act on it rather than converse about it.

### Principle 6: Retries are bounded

Two retries after the initial attempt are the recommended maximum for
normal quiz generation.

### Principle 7: Fail cleanly

If generation cannot become valid, stop and show a user-safe error.

### Principle 8: UI status belongs to the application

The model should not control the frontend loading experience.

### Principle 9: Difficulty describes cognitive demand

Hard questions should require deeper reasoning, not obscure trivia.

### Principle 10: Optimize for first-pass quality

Retries are recovery, not the primary generation strategy.

### Principle 11: Persist only validated data

Invalid model output must never directly enter the database.

### Principle 12: Boring infrastructure is good infrastructure

The LLM can be creative where content benefits from creativity. The
surrounding system should be deterministic, explicit, and boring.

------------------------------------------------------------------------

# 42. Final Expected Behavior

A complete successful request should behave like this:

``` text
User selects:
    Difficulty: Hard
    Questions: 10
    Source: supplied material

        ↓

Backend validates request

        ↓

Frontend:
    "Building the tougher questions..."

        ↓

Groq generates structured output

        ↓

Backend validates structure and semantics

        ↓

If invalid:
    "Checking the reasoning..."
    or
    "Final polishing..."

        ↓

Model receives:
    previous output
    deterministic validation feedback

        ↓

Model returns corrected complete output

        ↓

Backend validates again

        ↓

If valid:
    Generate UUIDs
    Persist quiz
    Return success

        ↓

Frontend:
    "Done"

        ↓

Render quiz
```

If all attempts fail:

``` text
Backend:
    stop after maximum retry count

        ↓

Frontend:
    "We couldn't finish your quiz.
     Something went wrong while generating the questions.
     Please try again."
```

The user should never see raw model output, raw schema errors, internal
retry details, system prompts, API errors, or validation internals.

------------------------------------------------------------------------

# 43. Final Mental Model

The entire system can be reduced to this:

``` text
              MODEL
                |
        "Generate good content"
                |
                v
         STRICT STRUCTURE
                |
        "Return correct shape"
                |
                v
          VALIDATOR
                |
        "Is this actually valid?"
                |
          +-----+-----+
          |           |
         YES          NO
          |           |
          v           v
       UUIDs       Feedback
          |           |
          v           v
      Database     Retry
          |           |
          +-----<-----+
```

The most important architectural decision is not the exact Groq model,
SDK choice, or wording of a loading message.

It is the **trust boundary**:

> **The model proposes. The application validates. The application
> assigns identity. The database persists.**

Everything else should be built around that boundary.
