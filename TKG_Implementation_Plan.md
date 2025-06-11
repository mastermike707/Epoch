# TKG Implementation Plan

This document outlines the detailed implementation steps for the Knowledge Graph application, following the phased approach defined in the architecture plan.

## Phase 1: Foundational Setup & Core Note Management (MVP)

### AWS & Project Setup:
- [ ] Create an AWS account and configure AWS CLI.
- [ ] Install AWS SAM CLI or Serverless Framework (Decision: Prefer AWS SAM CLI for tighter integration with AWS services, or Serverless Framework for broader cloud support. Let's proceed with **AWS SAM CLI** as the primary choice for this plan).
- [ ] Create your GitHub repository and set up basic CI/CD.
- [ ] Initialize a new React project using Vite.
- [ ] Initialize a new Spring Boot project using Gradle.


### Authentication (AWS Cognito):
- [ ] Set up an AWS Cognito User Pool for user authentication (sign-up, sign-in).
- [ ] Integrate AWS Amplify (recommended) into your React app for Cognito authentication.
- [ ] Implement basic user registration and login forms in React.
- [ ] Create an API Gateway Authorizer using Cognito to protect your backend APIs.

### Backend Core (Java Spring Boot on Lambda):
- [ ] Configure Spring Boot application to run as an AWS Lambda function (e.g., using spring-cloud-function-web and spring-cloud-function-adapter-aws).
- [ ] Define a basic HelloController Lambda function and deploy it via API Gateway using SAM/Serverless. Test a GET /hello endpoint.
- [ ] Configure application.properties for Lambda environment variables.

### Database Setup (AWS RDS PostgreSQL):
- [ ] Launch an AWS RDS PostgreSQL instance (consider free tier or smallest instance for now).
- [ ] Create the initial database schema for users and notes tables.
  - `notes` table: `id` (UUID), `user_id`, `title`, `content` (JSONB for blocks), `created_at`, `updated_at`.
- [ ] Set up AWS RDS Proxy for efficient connection pooling from Lambda.
- [ ] Configure VPC and security groups to allow Lambda to connect to RDS.

### Note CRUD Backend:
- [ ] Integrate Spring Data JPA with your PostgreSQL database.
- [ ] Create Note entity and repository.
- [ ] Implement Spring Boot Lambda functions for:
  - `POST /notes` (Create Note)
  - `GET /notes` (List all notes for a user)
  - `GET /notes/{id}` (Get a specific note)
  - `PUT /notes/{id}` (Update a note)
  - `DELETE /notes/{id}` (Delete a note)
- [ ] Secure these endpoints using the Cognito Authorizer.

### Frontend Note Management UI:
- [ ] Create React components for:
  - A dashboard/list to display user's notes.
  - A basic rich text editor (Decision: Start with a simple `textarea` for MVP, then upgrade to a library like **Draft.js** or **Slate.js** in a later iteration).
  - Forms for creating and editing notes.
- [ ] Implement API calls from React to your Spring Boot Lambda endpoints.
- [ ] Enable user authentication and session management in the frontend.

### Test Phase 1:
- [ ] Write tests that ensure the application can properly CRUD notes.
## Phase 2: Knowledge Graph Integration & Basic Search

### Neo4j AuraDB Setup:
- [ ] Create a free tier or trial instance of Neo4j AuraDB.
- [ ] Get connection details (URI, username, password).

### Knowledge Graph Backend:
- [ ] Add `node_id` (e.g., UUID) to your notes table and expose it in your Note model.
- [ ] Integrate **Spring Data Neo4j** into your Spring Boot Lambda project (Decision: Spring Data Neo4j is preferred for Spring Boot integration).
- [ ] Implement a mechanism to synchronize note creation/updates with Neo4j (e.g., direct calls from Note CRUD Lambdas, or asynchronous event processing via SQS/SNS).
- [ ] When a note is created/updated, create/update a corresponding node in Neo4j.
- [ ] Implement Lambda functions for:
  - `POST /notes/{sourceNoteId}/links` (Create a link from source to target note, e.g., `(SourceNote)-[:LINKS_TO]->(TargetNote)`)
  - `DELETE /notes/{sourceNoteId}/links/{targetNoteId}`
  - `GET /notes/{noteId}/backlinks` (Query incoming links from Neo4j)
  - `GET /notes/{noteId}/forwardlinks` (Query outgoing links from Neo4j)

### Frontend Linking UI:
- [ ] In the note editor, implement a way to create links (e.g., `[[Note Title]]` syntax auto-completion, or a dedicated linking dialog).
- [ ] Display clickable links within the note content.
- [ ] Display a "Linked Notes" section showing both forward and back links for the current note.
- [ ] (Optional) Integrate a basic force-directed graph visualization library (like react-force-graph or D3.js) to show a small local graph of linked notes.

### Search Backend (AWS OpenSearch Service):
- [ ] Provision an AWS OpenSearch Service domain.
- [ ] Configure security groups to allow Lambda access to OpenSearch.
- [ ] Integrate the **OpenSearch Java client** into your Spring Boot Lambda (Decision: Use the official OpenSearch client).
- [ ] Implement a mechanism to synchronize note creation/updates with OpenSearch (e.g., direct calls from Note CRUD Lambdas, or asynchronous event processing via SQS/SNS).
- [ ] Implement a Lambda function that indexes notes into OpenSearch whenever they are created/updated.
- [ ] Create a Lambda function for `GET /search?q={query}` to perform basic full-text search.

### Frontend Search UI:
- [ ] Add a global search bar in your React app.
- [ ] Display search results and allow users to navigate to notes from results.

## Phase 3: Deep Calendar & Timeline Integration

### Enhance Note Data Model (PostgreSQL):
- [ ] Create a new `calendar_events` table (Decision: A separate table is better for managing complex temporal data and avoids bloating the `notes` table):
  - `event_type` (e.g., `date_point`, `date_range`, `recurring`)
  - `start_date` (Date/Timestamp)
  - `end_date` (Date/Timestamp, nullable for points)
  - `recurrence_rule` (TEXT/JSONB, e.g., iCalendar RRULE format)
  - `associated_note_id` (FK to notes table).
- [ ] Add a GiST index on `daterange` or `tsrange` if using PostgreSQL's native range types for (`start_date`, `end_date`). This is a key DSA application for interval queries.

### Backend Temporal Logic:
- [ ] Implement logic in Spring Boot Lambda to:
  - Parse and validate `recurrence_rule` (Consider using a library like `ical4j` for Java).
  - Expand recurrence rules into concrete instances for a given date range (e.g., 1 year into the future).
  - `GET /calendar/events?start={date}&end={date}`: Query for all notes/events that overlap with the given date range. This is where your DSA for Interval Trees/GiST index becomes critical for efficiency.
  - `GET /notes/{id}/temporal-info` (to retrieve temporal details for a specific note).
- [ ] Integrate temporal querying into OpenSearch for combined search (e.g., `search?q=meeting&date_range_overlap=2025-06-01_2025-06-30`).

### Frontend Calendar & Timeline UI:
- [ ] Integrate a React calendar library (Decision: Evaluate **react-big-calendar** or **FullCalendar.io**; start with **react-big-calendar** for simplicity).
- [ ] Populate the calendar with notes and events fetched from the backend.
- [ ] Implement a custom rendering for calendar events to show note titles/icons.
- [ ] Create a separate timeline view component to visualize events chronologically (Decision: Consider **D3.js** for custom visualization or a dedicated timeline library).
- [ ] Add UI for assigning dates, ranges, and recurrence rules to notes in the editor.

## Phase 4: Advanced Features, Optimization & Deployment

### Version History:
- [ ] Backend: Modify note update Lambda to save diffs or full snapshots of note content (JSONB) (Decision: Store in a separate `note_versions` table in PostgreSQL for easier transactional consistency with notes, or S3 for very large content/cost efficiency. Let's start with a **PostgreSQL `note_versions` table**).
- [ ] Implement Lambda functions to retrieve specific versions or a history of changes for a note.
- [ ] Frontend: Implement a "View History" UI for notes, showing previous versions and allowing rollback.

### Advanced Combined Search:
- [ ] Backend (OpenSearch): Refine your OpenSearch indexing to include tags and link information.
- [ ] Implement a sophisticated search Lambda that can combine:
  - Full-text search.
  - Temporal range overlap.
  - Tag filtering.
  - Filtering by notes linked to/from specific other notes (leveraging Neo4j queries integrated with OpenSearch results - Strategy: Fetch linked note IDs from Neo4j first, then use these IDs in an OpenSearch query).
- [ ] Frontend: Design an advanced search interface with multiple filter inputs.

### Performance Optimization:
- [ ] Lambda Cold Starts: Implement AWS Lambda SnapStart for Java (if available in your region) or configure Provisioned Concurrency for critical Lambda functions.
- [ ] Database Connection Pooling: Ensure RDS Proxy is correctly configured and utilized by all Lambdas connecting to PostgreSQL.
- [ ] Caching (AWS ElastiCache - Redis):
  - [ ] Set up an ElastiCache Redis instance.
  - [ ] Integrate Spring Cache or direct Redis client to cache frequently accessed data (e.g., popular notes, user preferences, complex calendar query results).
- [ ] Cost Monitoring: Set up AWS Budgets to monitor your spending.

### Robustness & Observability:
- [ ] Implement comprehensive logging (use SLF4J/Logback in Spring Boot, which will integrate with CloudWatch Logs).
- [ ] Set up AWS CloudWatch Alarms for critical errors and performance metrics (Lambda invocations, errors, duration).
- [ ] Implement robust error handling in both frontend and backend (Strategy: Implement retry mechanisms, dead-letter queues (DLQs) for critical Lambdas, and circuit breakers for external service calls).

### Final Deployment & CI/CD:
- [ ] Review and refine your SAM/Serverless Framework templates for all resources.
- [ ] Set up a full CI/CD pipeline using **AWS CodePipeline** or **GitHub Actions** for automated testing and deployment of both frontend and backend (Decision: Prefer **GitHub Actions** for its flexibility and integration with GitHub repository).
- [ ] Configure custom domains and SSL certificates for your API Gateway and CloudFront.
- [ ] Write a comprehensive `README.md` for your project, detailing architecture, how to run locally, and deployment instructions.