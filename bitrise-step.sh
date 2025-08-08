#!/bin/bash
set -ex

echo "APK PATH HERE: "
echo $BITRISE_APK_PATH

# Step 1: Clone your repo
git clone https://github.com/priscila225/appium_cucumber.git

# Step 2: Enter the directory
cd appium_cucumber

cp $BITRISE_APK_PATH .

ls

# Step 3: Install dependencies
npm install

# Step 4: Run your test
npm run sample-test

# Step 5: Upload HTML report to S3
# REPORT_HTML_PATH="$(pwd)/report/report"
# S3_BUCKET="hearst.bitrise"
# S3_PATH="bitrise_android/${BITRISE_GIT_BRANCH}/build_${BITRISE_BUILD_NUMBER}/htmlReport"

# echo "HTML Report Path: $REPORT_HTML_PATH"
# echo "S3 Bucket: $S3_BUCKET"
# echo "S3 Path: $S3_PATH"

# if [ -d "$REPORT_HTML_PATH" ]; then
#     echo "Report directory contents:"
#     ls -la "$REPORT_HTML_PATH"
    
#     echo "Uploading HTML report to S3..."
#     aws s3 sync "$REPORT_HTML_PATH" "s3://$S3_BUCKET/$S3_PATH/" \
#         --access-key-id "$AWS_ACCESS_KEY" \
#         --secret-access-key "$AWS_SECRET_KEY" \
#         --region us-east-1
    
#     if [ $? -eq 0 ]; then
#         echo "HTML report uploaded successfully to S3"
#         echo "S3 URL: https://$S3_BUCKET.s3.amazonaws.com/$S3_PATH/index.html"
#     else
#         echo "Failed to upload HTML report to S3"
#     fi
# else
#     echo "Report directory not found at $REPORT_HTML_PATH"
# fi

echo "Bitrise browserstack step completed successfully"
exit 0
