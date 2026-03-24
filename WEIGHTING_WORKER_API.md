# Weighting Worker API

Documentation for the Python server integration with the NestJS weighting pipeline.

---

## Authentication

All requests must include:

```
Authorization: Bearer <HCS_API_KEY>
```

---

## Flow Overview

```
1. NestJS fires POST /weighting to Python (webhook)
2. Python calls GET /weighting/worker/{job_id}/details → downloads inputs from S3
3. Python processes the job
4. Python calls GET /weighting/worker/{job_id}/upload-urls → gets S3 upload URLs
5. Python uploads output files directly to S3
6. Python calls PUT /weighting/worker/{job_id}/complete (or /fail)
```

---

## Endpoints

### 1. Receive Webhook

NestJS fires this to `PYTHON_URL/weighting` immediately after a job is created. Python must expose this route.

```
POST /weighting
Content-Type: application/json

{ "job_id": "83612053-81c9-4129-8359-f65a2a6ce30e" }
```

Respond with any `2xx` immediately — NestJS does not wait for processing to complete.

---

### 2. Get Job Details + Input Download URLs

```
GET /weighting/worker/{job_id}/details
Authorization: Bearer <HCS_API_KEY>
```

> Calling this endpoint automatically sets the job state to `processing`. Presigned URLs expire in **2 hours**.

**Response:**

```json
{
  "job": {
    "job_id": "83612053-81c9-4129-8359-f65a2a6ce30e",
    "job_type": "training",
    "state": "processing",
    "splitting_technique": "70/30",
    "splitting_seed": 42,
    "model": "gpt-4o",
    "output_model": "gpt-4o",
    "source_training_job_id": null
  },
  "input_urls": {
    "questionnaire": "https://s3.../questionnaire.json?...",
    "individual_training": "https://s3.../individual_training.json?...",
    "final_weight": "https://s3.../final_weight.json?..."
  }
}
```

| Field | Present for |
|-------|-------------|
| `output_model` | Training jobs only |
| `source_training_job_id` | Evaluation jobs only |
| `input_urls.individual_training` | Training jobs only |
| `input_urls.final_weight` | Evaluation jobs only |

---

### 3. Get Presigned Output Upload URLs

```
GET /weighting/worker/{job_id}/upload-urls
Authorization: Bearer <HCS_API_KEY>
```

> Presigned URLs expire in **1 hour**.

**Response — Training job:**

```json
{
  "final_weight_key": "weighting_files/{job_id}/outputs/final_weight.json",
  "final_weight_url": "https://s3...?..."
}
```

**Response — Evaluation job:**

```json
{
  "results_xlsx_key": "weighting_files/{job_id}/outputs/training_individual_results.xlsx",
  "results_xlsx_url": "https://s3...?...",
  "figures_pdf_key": "weighting_files/{job_id}/outputs/figures_report.pdf",
  "figures_pdf_url": "https://s3...?..."
}
```

---

### 4. Upload Outputs to S3

Upload each file directly to its presigned URL using `PUT` with the correct `Content-Type`.

```
PUT {presigned_url}
Content-Type: <see table below>

<file bytes>
```

| File | Content-Type |
|------|-------------|
| `final_weight.json` | `application/json` |
| `training_individual_results.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `figures_report.pdf` | `application/pdf` |

Empty response body = success (HTTP 200).

---

### 5. Mark Job Complete

```
PUT /weighting/worker/{job_id}/complete
Authorization: Bearer <HCS_API_KEY>
Content-Type: application/json
```

**Body — Training:**

```json
{
  "output_keys": {
    "final_weight_key": "weighting_files/{job_id}/outputs/final_weight.json"
  }
}
```

**Body — Evaluation:**

```json
{
  "output_keys": {
    "results_xlsx_key": "weighting_files/{job_id}/outputs/training_individual_results.xlsx",
    "figures_pdf_key": "weighting_files/{job_id}/outputs/figures_report.pdf"
  }
}
```

**Response:** `{ "success": true }`

> Triggers a completion email to the user with a direct link to the dashboard.

---

### 6. Mark Job Failed

```
PUT /weighting/worker/{job_id}/fail
Authorization: Bearer <HCS_API_KEY>
Content-Type: application/json

{ "error_message": "Describe what went wrong" }
```

**Response:** `{ "success": true }`

> Triggers a failure email to the user with the error message displayed.

---

## Python Example

```python
import requests

BASE_URL = "https://api.christian-brinck-phd.com"
HEADERS = {"Authorization": "Bearer <HCS_API_KEY>"}


def handle_weighting_webhook(job_id: str):
    # 1. Get job details + presigned input URLs
    details = requests.get(f"{BASE_URL}/weighting/worker/{job_id}/details", headers=HEADERS).json()
    job = details["job"]
    input_urls = details["input_urls"]

    # 2. Download inputs from S3
    questionnaire = requests.get(input_urls["questionnaire"]).json()
    if job["job_type"] == "training":
        individual_training = requests.get(input_urls["individual_training"]).json()
    else:
        final_weight = requests.get(input_urls["final_weight"]).json()

    # 3. Process job ...
    outputs = run_pipeline(job, questionnaire, ...)

    # 4. Get presigned upload URLs
    upload_urls = requests.get(f"{BASE_URL}/weighting/worker/{job_id}/upload-urls", headers=HEADERS).json()

    # 5. Upload outputs directly to S3
    if job["job_type"] == "training":
        requests.put(upload_urls["final_weight_url"], data=outputs["final_weight"], headers={"Content-Type": "application/json"})
        output_keys = {"final_weight_key": upload_urls["final_weight_key"]}
    else:
        requests.put(upload_urls["results_xlsx_url"], data=outputs["xlsx"], headers={"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})
        requests.put(upload_urls["figures_pdf_url"], data=outputs["pdf"], headers={"Content-Type": "application/pdf"})
        output_keys = {
            "results_xlsx_key": upload_urls["results_xlsx_key"],
            "figures_pdf_key": upload_urls["figures_pdf_key"],
        }

    # 6. Mark complete
    requests.put(f"{BASE_URL}/weighting/worker/{job_id}/complete", json={"output_keys": output_keys}, headers=HEADERS)
```

In case of error:

```python
    except Exception as e:
        requests.put(f"{BASE_URL}/weighting/worker/{job_id}/fail", json={"error_message": str(e)}, headers=HEADERS)
```
