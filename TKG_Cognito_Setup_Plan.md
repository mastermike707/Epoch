# TKG AWS Cognito Setup Plan

This document outlines the detailed steps to integrate AWS Cognito for user authentication and secure the backend APIs for the Knowledge Graph application.

## Plan for AWS Cognito Setup

1.  **Create Cognito User Pool:**
    *   Define a unique name for the User Pool.
    *   Configure sign-in methods (e.g., email, username, or both).
    *   Establish a strong password policy.
    *   Specify required user attributes (e.g., email, name).
    *   Consider enabling Multi-Factor Authentication (MFA) for enhanced security.
    *   Create an App Client within the User Pool for the frontend application.
    *   Record the generated User Pool ID and App Client ID for later use.

2.  **Integrate AWS Amplify into React App:**
    *   Install the necessary AWS Amplify client libraries in the frontend React project.
    *   Configure Amplify in the React application using the Cognito User Pool ID, App Client ID, and AWS Region.
    *   Leverage Amplify's authentication modules and UI components (if applicable) to streamline the integration.

3.  **Implement Basic User Registration and Login Forms in React:**
    *   Develop dedicated React components for user sign-up and sign-in functionalities.
    *   Utilize Amplify's `Auth` module to handle user registration, login, and session management.
    *   Implement robust error handling and user feedback mechanisms for authentication flows.
    *   Set up basic routing to differentiate between authenticated and unauthenticated views.

4.  **Create API Gateway Authorizer using Cognito:**
    *   In AWS API Gateway, create a new `Cognito User Pool Authorizer`.
    *   Associate this authorizer with the previously created Cognito User Pool.
    *   Apply this authorizer to the relevant backend API endpoints (e.g., all `/notes` CRUD operations) to protect them.
    *   Ensure the Spring Boot Lambda functions are configured to receive and process the authenticated user's identity information passed by the API Gateway Authorizer.

## Architecture Flow for Cognito Integration

```mermaid
graph TD
    A[User] --> B(Frontend React App);
    B -- Sign Up/In --> C(AWS Cognito User Pool);
    C -- Returns ID/Access Tokens --> B;
    B -- Authenticated Request with Token --> D(AWS API Gateway);
    D -- Authorize Request using Token --> C;
    D -- If Authorized, Forwards Request --> E(Backend Spring Boot Lambda);
    E -- Interacts with --> F(AWS RDS PostgreSQL);