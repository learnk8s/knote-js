# knote

A simple note taking application to demonstrate packaging, deploying and scaling a Node.js application with containers and Kubernetes.

## Install

You can install the dependencies with:

```bash
npm install
```

The application expects a MongoDB instance. You can start a local instance with Docker with:

```bash
docker run -p 27017:27017 -v /tmp/mongotest:/data/db -d mongo
```

The second iteration of the application requires [MinIO](https://github.com/minio/minio) — an S3 compatible blob storage.

You can launch a local instance with Docker with:

```bash
docker run -p 9000:9000 \
  -e "MINIO_ACCESS_KEY=EXAMPLEKEY" \
  -e "MINIO_SECRET_KEY=EXAMPLESECRET" \
  minio/minio server /data
```

## Running the app

You can run the application with:

```bash
npm run start
```

The application should be available on <http://localhost:3000>.
