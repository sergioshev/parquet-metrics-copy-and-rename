# Steps before deploy the cloud function (infrastructure setup)
All following steps assume you are logged in gcloud, and gcloud/gsutil is correctly installed

- Login to google cloud and setup default project id
```
gcloud auth login
gcloud config set project perceptive-zoo-351213
```

- Get the service account email
This step is necessary to setup pubsub publisher role
```
gsutil kms serviceaccount -p perceptive-zoo-351213
```
it should output something like `service-444321464088@gs-project-accounts.iam.gserviceaccount.com`

- Create pubsub topic/subs for GCS event notifications with retention period 
```
gcloud pubsub topics create etl-cs-notification-prod
gcloud pubsub subscriptions create etl-cs-notification-prod-sub --topic etl-cs-notification-prod --message-retention-duration 7d 
```

- Grant publisher permission to service account from the previous step
Check members array is containing service account from step above (`Get the service account email`)
```
cat <<FFAA | gcloud pubsub topics set-iam-policy projects/perceptive-zoo-351213/topics/etl-cs-notification-prod /dev/stdin
{
  "bindings": [
    {
      "members": [
        "serviceAccount:service-444321464088@gs-project-accounts.iam.gserviceaccount.com"
      ],
      "role": "roles/pubsub.publisher"
    }
  ],
  "version": 1
}
FFAA
```

- List and create notification configuration associated to a GCS bucked
  - create
```
gsutil notification create -t etl-cs-notification-prod -f json gs://af-xpend-cost-etl-acc-imjbu2hf-prod
```
  - verify it was created
```
gsutil notification list gs://af-xpend-cost-etl-acc-imjbu2hf-prod
```
# Finally deploy the cloud function
```
npm run deploy-prod
```