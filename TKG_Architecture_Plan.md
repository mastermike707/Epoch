# Detailed Temporal Knowledge Graph (TKG) Architecture Plan

The core idea remains to decouple frontend, backend APIs, and specialized services, leveraging AWS managed services as much as possible for a serverless-first approach.

## 1. Frontend (React)

*   **Technology:** React, developed using Vite.
*   **Hosting & Deployment:** **AWS Amplify Console**.
    *   **Rationale:** Chosen for its ease of setup, integrated CI/CD (connecting directly to Git repository), automatic preview environments for pull requests, and simplified management of custom domains and SSL.
    *   **Environments:** We will configure branch-based deployments (e.g., `main` for production, `develop` for staging/test, `feature/*` for preview environments) and can implement manual approval steps for production deployments.

## 2. Backend (Java Spring Boot on AWS Lambda)

*   **API Gateway:** RESTful APIs exposed via Amazon API Gateway.
*   **Lambda Functions:** Each API endpoint (or group of related endpoints) will trigger a Java Spring Boot application running as an AWS Lambda function.
*   **Cold Starts:** Strategies like AWS Lambda SnapStart or Provisioned Concurrency will be considered for production readiness.
*   **Logging & Monitoring:** **AWS CloudWatch**.
    *   **Rationale:** Native integration with Lambda for capturing standard output logs and automatic collection of key Lambda metrics (invocations, errors, duration, throttles). Custom dashboards and alarms will be configured.
*   **Secret Management:** **AWS Secrets Manager**.
    *   **Rationale:** Securely stores sensitive credentials (database passwords, API keys) encrypted at rest and in transit. Lambda functions will retrieve secrets at runtime, avoiding hardcoding. Automatic rotation of database credentials will be leveraged where applicable.

## 3. Database Layer

*   **Relational Data (Notes, Blocks, Users, Recurrence Rules):** Amazon RDS for PostgreSQL.
    *   **Connection Pooling:** RDS Proxy for efficient connection pooling from Lambda.
    *   **Flexible Storage:** PostgreSQL's JSONB for flexible block storage and potential GiST indexes for temporal ranges.
    *   **Backup & Recovery:** Rely on AWS RDS automated backups, point-in-time recovery, and potentially Multi-AZ deployments for high availability. Cross-region replication will be considered for disaster recovery.
*   **Graph Data (Links):** Neo4j AuraDB (fully managed serverless-like Neo4j service).
    *   **Functionality:** For bi-directional linking and graph traversal.
    *   **Backup & Recovery:** Leverage Neo4j AuraDB's built-in backup and restore features.
*   **Data Consistency Strategy (RDS & Neo4j):**
    *   **Proposed Approach:** We will primarily treat **Amazon RDS for PostgreSQL as the source of truth** for all core data, including the raw link information. Neo4j AuraDB will serve as a **secondary, denormalized view of relationships**, populated from RDS.
    *   **Synchronization Mechanism:** This will likely involve **event-driven mechanisms** (e.g., AWS Lambda functions triggered by RDS Change Data Capture (CDC) or by events published to AWS SQS/SNS from the application layer after an RDS write) to maintain eventual consistency. This decouples the databases and simplifies conflict resolution.

## 4. Search Engine (Full-Text & Temporal)

*   **Service:** AWS OpenSearch Service (managed Elasticsearch).
*   **Functionality:** For powerful, scalable full-text and temporal search capabilities.
*   **Indexing Strategy & Consistency:** An **event-driven indexing strategy** will be used to populate OpenSearch. Changes in RDS (and subsequently Neo4j) will trigger events (e.g., via AWS DMS CDC to Kinesis/SQS, consumed by Lambda functions) that update the OpenSearch index in near real-time. This approach ensures eventual consistency, providing fresh search results with minimal latency.

## 5. Authentication

*   **Service:** Amazon Cognito.
*   **Functionality:** For user sign-up, sign-in, and managing user identities.
*   **Integration Details:** Amazon Cognito User Pools will handle user sign-up, sign-in, and registration. It will integrate with the React frontend to manage user sessions and allow the application to identify the connected user. The JWT (JSON Web Token) information obtained from Cognito will be passed to the Lambda backend with each authenticated request, where API Gateway will handle JWT validation before forwarding to the Lambda function.


## 6. Deployment

*   **Infrastructure as Code (IaC):** **AWS Serverless Application Model (SAM)**.
    *   **Rationale:** Chosen for its simplicity and native integration with AWS services, making it an ideal AWS-based solution for defining and deploying serverless applications.
*   **Further Consideration:**
    *   **CI/CD Pipeline:** Define the full CI/CD pipeline for backend deployments using SAM, including testing, staging, and production environments.

## 7. Cross-Cutting Concerns & Further Considerations

*   **API Design:**
    *   **Granularity:** **Fine-grained Lambdas**. Each API endpoint or a small, related group of endpoints will be handled by its own Java Spring Boot Lambda function. This allows for more granular scaling and isolated deployments.
    *   **Error Handling:** A **standardized error handling strategy** will be implemented, using consistent JSON error responses (e.g., `code`, `message`, `details`) and appropriate HTTP status codes. Centralized exception handling in Spring Boot will map exceptions to these responses, with detailed logging to CloudWatch.
    *   **Versioning:** API versioning will not be supported.
*   **Security:**
    *   **IAM Roles:** Principle of least privilege for all Lambda functions and other AWS resources.
    *   **Network Security:** VPC configuration for RDS, Lambda, and OpenSearch to ensure private communication.
    *   **Data Encryption:** Ensure data is encrypted at rest and in transit across all services.
    *   **WAF:** Consider AWS WAF for API Gateway to protect against common web exploits.
*   **Scalability & Performance:**
    *   Beyond Lambda cold starts, consider the scaling characteristics of RDS, Neo4j AuraDB, and OpenSearch under load.
    *   Performance testing and load testing strategy.
*   **Cost Optimization:**
    *   Beyond serverless benefits, consider data transfer costs, storage tiers, and reserved instances for RDS if applicable.
*   **Data Migration:**
    *   Strategy for initial data loading and any future data migrations.
*   **Offline Capabilities/Real-time Updates:**
    *   In the future, may support websockets for real time collaboration.

---

### High-Level Architecture Diagram

```mermaid
graph TD
    A[User] --> B(AWS Amplify Console)
    B --> C{CloudFront}
    C --> D[S3 Bucket: Frontend Assets]

    B -- API Calls --> E(API Gateway)
    E -- Triggers --> F[AWS Lambda: Spring Boot Backend]

    F -- Connects via RDS Proxy --> G[Amazon RDS: PostgreSQL]
    G -- Data Sync (Event-Driven) --> H[Neo4j AuraDB]
    F -- Indexes Data --> I[AWS OpenSearch Service]

    J[Amazon Cognito] -- Auth --> B
    J -- Auth --> E

    F -- Stores/Retrieves --> K[AWS S3: Binary Assets]
    F -- Retrieves --> L[AWS Secrets Manager]

    subgraph Deployment
        M[Git Repository] --> N(AWS SAM / Serverless Framework)
    end

    N --> B
    N --> E
    N --> F
    N --> G
    N --> I
    N --> J
    N --> K
    N --> L
