{{/*
Expand the name of the chart.
*/}}
{{- define "#TEMPLATE_NAME#.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "#TEMPLATE_NAME#.fullname" -}}
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
{{- define "#TEMPLATE_NAME#.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "#TEMPLATE_NAME#.labels" -}}
helm.sh/chart: {{ include "#TEMPLATE_NAME#.chart" . }}
{{ include "#TEMPLATE_NAME#.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
inm.CostAllocation.CostCentre: {{ .Values.inmCostAllocationCostCentre  | quote }}
inm.CostAllocation.Product: {{ .Values.inmCostAllocationProduct }}
inm.CostAllocation.Application: {{ .Values.inmCostAllocationApplication }}
management-zone: integration
origin: #ORIGIN#
uniqueid: '#UNIQUEID#'
{{- end }}

{{/*
Selector labels
*/}}
{{- define "#TEMPLATE_NAME#.selectorLabels" -}}
app.kubernetes.io/name: {{ include "#TEMPLATE_NAME#.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "#TEMPLATE_NAME#.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "#TEMPLATE_NAME#.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
