# Steps before deploy the cloud function (infrastructure setup)
All following steps assume you are logged in the cloud, and gcloud/gsutil terminal commands are correctly installed

- Login to google cloud and setup default project id
```
gcloud auth login
gcloud config set project <PROJECT_ID>
```

- Get the service account email

This step is necessary to setup pubsub publisher role
```
gsutil kms serviceaccount -p <PROJECT_ID>
```
it should output something like `service-xxxxxxx@.......iam.gserviceaccount.com`

- Create pubsub topic/subs for GCS event notifications with retention period 
```
gcloud pubsub topics create etl-cs-notification-prod
gcloud pubsub subscriptions create etl-cs-notification-prod-sub --topic etl-cs-notification-prod --message-retention-duration 7d 
```

- Grant publisher permission to service account from the previous step

Check members array is containing service account from step above (`Get the service account email`)
```
cat <<FFAA | gcloud pubsub topics set-iam-policy projects/<PROJECT_ID>/topics/etl-cs-notification-prod /dev/stdin
{
  "bindings": [
    {
      "members": [
        "serviceAccount:service-xxxxxxx@.......iam.gserviceaccount.com"
      ],
      "role": "roles/pubsub.publisher"
    }
  ],
  "version": 1
}
FFAA
```

- List and create notification configuration associated to a GCS bucket
  - create
```
gsutil notification create -t etl-cs-notification-prod -f json gs://<BUCKET_NAME_OBSERVED>
```
  - verify it was created
```
gsutil notification list gs://<BUCKET_NAME_OBSERVED>
```
# Finally deploy the cloud function
```
npm run deploy-prod
```
