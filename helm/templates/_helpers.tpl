{{/*
Expand the name of the chart.
*/}}
{{- define "nodetest.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "nodetest.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "nodetest.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "nodetest.labels" -}}
helm.sh/chart: {{ include "nodetest.chart" . }}
{{ include "nodetest.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
inm.CostAllocation.CostCentre: {{ .Values.inmCostAllocationCostCentre  | quote }}
inm.CostAllocation.Product: {{ .Values.inmCostAllocationProduct }}
inm.CostAllocation.Application: {{ .Values.inmCostAllocationApplication }}
management-zone: integration
origin: abc123
uniqueid: 'abc123'
{{- end }}

{{/*
Selector labels
*/}}
{{- define "nodetest.selectorLabels" -}}
app.kubernetes.io/name: {{ include "nodetest.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "nodetest.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "nodetest.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
