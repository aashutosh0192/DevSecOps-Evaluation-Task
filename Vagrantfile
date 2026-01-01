Vagrant.configure("2") do |config|
  # Global SSH and boot settings
  config.ssh.forward_agent = false
  config.ssh.extra_args = ["-o", "HostKeyAlgorithms=+ssh-rsa", "-o", "PubkeyAcceptedAlgorithms=+ssh-rsa"]
  config.vm.boot_timeout = 900 # Increased timeout for heavy provisioning

  config.vm.provider "virtualbox" do |vb|
    vb.gui = false
  end

  # CI VM (Jenkins, Docker, Trivy, Semgrep)
  config.vm.define "ci" do |ci|
    ci.vm.box = "ubuntu/jammy64"
    ci.vm.hostname = "ci"
    ci.vm.network "private_network", ip: "192.168.56.10"
    ci.vm.provider "virtualbox" do |vb|
      vb.memory = 2048
      vb.cpus = 2
    end
    ci.vm.provision "shell", inline: <<-SHELL
      apt-get update -y
      apt-get install -y openjdk-11-jdk curl git jq
      curl -fsSL https://get.docker.com | sh
      usermod -aG docker vagrant
      wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | apt-key add -
      sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
      apt-get update -y && apt-get install -y jenkins
      systemctl enable jenkins && systemctl start jenkins
      curl -sL https://semgrep.dev/install.sh | sh
      apt-get install -y wget apt-transport-https
      wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | apt-key add -
      echo "deb https://aquasecurity.github.io/trivy-repo/deb stable main" | tee /etc/apt/sources.list.d/trivy.list
      apt-get update -y && apt-get install -y trivy
      docker run -d -p 5000:5000 --restart=always --name registry registry:2
    SHELL
  end

  # K8s VM (Hardened for kind/Kubernetes)
  config.vm.define "k8s" do |k8s|
    k8s.vm.box = "ubuntu/jammy64"
    k8s.vm.hostname = "k8s"
    k8s.vm.network "private_network", ip: "192.168.56.20"
    k8s.vm.provider "virtualbox" do |vb|
      vb.memory = 4096 # Increased to 4GB for K8s stability
      vb.cpus = 2      # Mandatory for K8s control plane
    end
    k8s.vm.provision "shell", inline: <<-SHELL
      apt-get update -y
      apt-get install -y docker.io curl conntrack
      usermod -aG docker vagrant
      
      # Configure Docker to use systemd cgroup driver for kind compatibility
      mkdir -p /etc/docker
      cat <<EOF > /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF
      systemctl restart docker

      # Install kind
      curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64
      chmod +x ./kind && mv ./kind /usr/local/bin/kind
      
      # Install kubectl
      curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
      chmod +x kubectl && mv kubectl /usr/local/bin/kubectl
    SHELL
  end

  # Tools VM (Terraform, Checkov, tfsec)
  config.vm.define "tools" do |tools|
    tools.vm.box = "ubuntu/jammy64"
    tools.vm.hostname = "tools"
    tools.vm.network "private_network", ip: "192.168.56.30"
    tools.vm.provider "virtualbox" do |vb|
      vb.memory = 1024
      vb.cpus = 1
    end
    tools.vm.provision "shell", inline: <<-SHELL
      apt-get update -y
      apt-get install -y unzip curl python3-pip
      curl -fsSL https://releases.hashicorp.com/terraform/1.9.5/terraform_1.9.5_linux_amd64.zip -o tf.zip
      unzip tf.zip && mv terraform /usr/local/bin/terraform
      pip3 install checkov
      curl -s https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash
    SHELL
  end
end