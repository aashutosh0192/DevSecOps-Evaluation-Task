How this Terraform maps to real EKS

- VPC module: Creates VPC, public/private subnets, NAT for private egress.
- EKS module: Control plane, endpoint access settings, IRSA for service accounts.
- Node groups: Managed groups with scaling configs, instance types.
- IAM role: App role demonstrating IAM definition.
- Note: Only validated locally; would require AWS credentials and terraform apply in real use.
