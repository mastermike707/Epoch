# Plan: API Gateway Cognito Authorizer

This document outlines the plan to create and configure an API Gateway Authorizer using the existing Cognito User Pool. This authorizer will be defined within the `backend/template.yaml` file, following the AWS Serverless Application Model (SAM) specification.

## 1. Prerequisite Information

Before modifying the `template.yaml`, we need the following values from the Cognito User Pool that was previously created:

*   **Cognito User Pool ARN:** The Amazon Resource Name (ARN) of the Cognito User Pool.
*   **Cognito User Pool App Client ID:** The ID of the App Client configured for the frontend application.

These values will be used to link the API Gateway Authorizer to the correct User Pool.

## 2. Plan for `backend/template.yaml` Modifications

The following steps will be performed in the `backend/template.yaml` file.

### Step 2.1: Define the Cognito User Pool Authorizer

A new resource of type `AWS::ApiGatewayV2::Authorizer` will be added to the `Resources` section of the `template.yaml` file. This will define the authorizer.

**Resource Definition:**

```yaml
Resources:
  # ... other resources
  ApiGatewayCognitoAuthorizer:
    Type: AWS::ApiGatewayV2::Authorizer
    Properties:
      Name: CognitoAuthorizer
      ApiId: !Ref HttpApi # Assuming the API Gateway is referenced as HttpApi
      AuthorizerType: JWT
      IdentitySource:
        - "$request.header.Authorization"
      JwtConfiguration:
        Audience:
          - !Ref CognitoAppClientId # This will be a parameter
        Issuer: !Sub "https://cognito-idp.${AWS::Region}.amazonaws.com/${CognitoUserPoolId}" # This will use a parameter
```

### Step 2.2: Add Parameters for Cognito Details

To avoid hardcoding values, we will add parameters to the `template.yaml` for the User Pool ID and App Client ID.

**Parameters Definition:**

```yaml
Parameters:
  # ... other parameters
  CognitoUserPoolId:
    Type: String
    Description: "The ID of the Cognito User Pool."
  CognitoAppClientId:
    Type: String
    Description: "The ID of the Cognito User Pool App Client."
```

### Step 2.3: Apply the Authorizer to API Routes

The newly created authorizer will be applied to the relevant API routes to protect them. This will be done by adding the `Authorizer` and `AuthorizationScopes` properties to the `Auth` section of the API event definition for each Lambda function that needs protection.

**Example for a protected route:**

```yaml
Events:
  Api:
    Type: HttpApi
    Properties:
      Path: /notes
      Method: GET
      Auth:
        Authorizer: CognitoAuthorizer
        AuthorizationScopes:
          - "email"
          - "openid"
          - "profile"
```

## 3. Implementation Steps Summary

1.  **Add Parameters:** Add `CognitoUserPoolId` and `CognitoAppClientId` to the `Parameters` section of `backend/template.yaml`.
2.  **Add Authorizer Resource:** Add the `ApiGatewayCognitoAuthorizer` resource to the `Resources` section of `backend/template.yaml`.
3.  **Update API Routes:** For each route that needs to be protected, add the `Auth` section with the `Authorizer` property set to `CognitoAuthorizer`.

This plan provides a clear path for a developer to implement the Cognito authorizer for the API Gateway.