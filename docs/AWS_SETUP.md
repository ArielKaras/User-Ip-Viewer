# AWS Setup Guide for Audio Documentation

This guide covers setting up an S3 bucket and configuring GitHub Actions OIDC to securely upload audio files without long-lived keys.

## 1. Create S3 Bucket

1.  Log in to the **AWS Console**.
2.  Go to **S3** and click **Create bucket**.
3.  **Bucket name**: Choose a unique name (e.g., `opsguard-audio-assets`).
4.  **Region**: `us-east-1` (or your preferred region).
5.  **Object Ownership**: Select **ACLs disabled** (Recommended).
    *   *Why?* This is the modern, secure default. We will control access via a Policy instead.
6.  **Block Public Access settings**:
    *   [ ] Block *all* public access (Uncheck this).
    *   *Note*: We need to uncheck this so we can attach a policy allowing public *downloads*.
    *   Check the warning box: "I acknowledge that the current settings..."
7.  Click **Create bucket**.

### Configure Bucket Policy (Public Read Only)
This is safer than ACLs because it explicitly limits public access to **Read Only**.
1.  Go to the **Permissions** tab of your new bucket.
2.  Scroll to **Bucket policy** and click **Edit**.
3.  Paste the following (Replace `YOUR-BUCKET-NAME`):
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
            }
        ]
    }
    ```
    *   *Security Note*: This allows anyone to **download** files (`GetObject`). It does **NOT** allow anyone to upload, delete, or modify your bucket. Your account remains secure.

### Configure Bucket CORS (Optional but Recommended)
To ensure the web player can communicate properly:
1.  Go to the specific bucket permissions tab.
2.  Scroll to **Cross-origin resource sharing (CORS)** and paste:
    ```json
    [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": []
        }
    ]
    ```

## 2. Create OIDC Provider (If not exists)

1.  Go to **IAM** -> **Identity providers**.
2.  Click **Add provider**.
3.  **Provider type**: `OpenID Connect`.
4.  **Provider URL**: `https://token.actions.githubusercontent.com`
5.  **Audience**: `sts.amazonaws.com`
6.  Click **Add provider**.

## 3. Create IAM Role for GitHub Actions

1.  Go to **IAM** -> **Roles**.
2.  Click **Create role**.
3.  Select **Web identity**.
4.  **Identity provider**: `token.actions.githubusercontent.com`.
5.  **Audience**: `sts.amazonaws.com`.
6.  **GitHub organization**: Enter your GitHub username or org name (e.g., `ArielKaras`).
7.  **GitHub repository**: Enter `User-Ip-Viewer` (or your repo name).
8.  Click **Next**.
9.  **Permissions**: Click **Create policy**.
    *   Select **JSON** and paste:
        ```json
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": "s3:PutObject",
                    "Resource": "arn:aws:s3:::opsguard-audio-assets/*"
                },
                {
                    "Effect": "Allow",
                    "Action": "s3:PutObjectAcl",
                    "Resource": "arn:aws:s3:::opsguard-audio-assets/*"
                }
            ]
        }
        ```
    *   *Note*: Replace `opsguard-audio-assets` with your actual bucket name.
    *   Name the policy (e.g., `OpsGuardAudioUploadPolicy`) and create it.
10. Back in the Role creation tab, select this new policy.
11. Name the role (e.g., `GitHubAction-AudioUploadRole`).
12. Create the role.
13. **Copy the ARN** of this new role (e.g., `arn:aws:iam::123456789012:role/GitHubAction-AudioUploadRole`).

## 4. Configure GitHub Secrets

1.  Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2.  Add the following Repository Secrets:
    *   `AWS_ROLE_ARN`: The ARN you just copied.
    *   `AWS_BUCKET_NAME`: Your bucket name (e.g., `opsguard-audio-assets`).
    *   `OPENAI_API_KEY`: Your OpenAI API Key.
