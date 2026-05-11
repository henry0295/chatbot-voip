#!/usr/bin/env bash

set -Eeuo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_err() { echo -e "${RED}[ERROR]${NC} $1"; }

on_error() {
  local exit_code=$?
  local line_no=${BASH_LINENO[0]}
  log_err "Falló en la línea ${line_no} (exit ${exit_code})."
  exit "${exit_code}"
}
trap on_error ERR

if [[ "${EUID}" -ne 0 ]]; then
  log_err "Ejecuta este script con sudo o como root."
  exit 1
fi

PROJECT_DIR="/opt/chatbot-voip"
REPO_URL="${REPO_URL:-https://github.com/henry0295/chatbot-voip.git}"
COMPOSE_CMD=""

detect_compose() {
  if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
    return
  fi
  if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
    return
  fi
  log_err "Docker Compose no está disponible."
  exit 1
}

install_base_deps() {
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y git curl ca-certificates
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y git curl ca-certificates
  elif command -v yum >/dev/null 2>&1; then
    yum install -y git curl ca-certificates
  elif command -v zypper >/dev/null 2>&1; then
    zypper --non-interactive install git curl ca-certificates
  elif command -v pacman >/dev/null 2>&1; then
    pacman -Sy --noconfirm git curl ca-certificates
  elif command -v apk >/dev/null 2>&1; then
    apk add --no-cache git curl ca-certificates
  else
    log_err "No se detectó gestor de paquetes soportado."
    exit 1
  fi
}

install_docker_if_needed() {
  if command -v docker >/dev/null 2>&1; then
    log_ok "Docker ya está instalado: $(docker --version)"
    return
  fi

  log_info "Instalando Docker..."
  
  # Para Rocky/RHEL/CentOS, intentar múltiples estrategias
  if command -v dnf >/dev/null 2>&1 || command -v yum >/dev/null 2>&1; then
    local pkg_manager="dnf"
    if ! command -v dnf >/dev/null 2>&1; then
      pkg_manager="yum"
    fi
    
    log_info "Detectado sistema basado en RHEL. Intentando instalar Docker..."
    
    # Estrategia 1: Intentar desde repositorios nativos de Rocky Linux (más confiable)
    log_info "Intento 1: Buscando docker en repositorios nativos de Rocky Linux..."
    if ${pkg_manager} install -y docker 2>/dev/null; then
      log_ok "Docker instalado desde repositorios nativos."
    else
      # Estrategia 2: Habilitar módulo docker y reintentar
      log_info "Intento 2: Habilitando módulo docker..."
      ${pkg_manager} module enable -y docker 2>/dev/null || true
      ${pkg_manager} install -y docker 2>/dev/null || {
        # Estrategia 3: Usar el instalador oficial como último recurso
        log_info "Intento 3: Usando instalador oficial de Docker..."
        curl -fsSL https://get.docker.com | sh || {
          # Estrategia 4: Ofrecer Podman como alternativa
          log_warn "No se pudo instalar Docker. Intentando instalar Podman como alternativa..."
          if ${pkg_manager} install -y podman podman-docker 2>/dev/null; then
            log_ok "Podman instalado. Usando Podman en lugar de Docker."
            # Crear alias para compatibilidad
            mkdir -p /etc/bash_completion.d
            echo 'alias docker=podman' >> /etc/bashrc
            return
          else
            log_err "No se pudo instalar Docker ni Podman."
            exit 1
          fi
        }
      }
    fi
  else
    # Para otros sistemas, usar el instalador oficial
    curl -fsSL https://get.docker.com | sh
  fi

  if command -v systemctl >/dev/null 2>&1; then
    systemctl enable docker >/dev/null 2>&1 || true
    systemctl start docker >/dev/null 2>&1 || true
  fi

  if ! command -v docker >/dev/null 2>&1; then
    log_err "No se pudo instalar Docker."
    exit 1
  fi
  log_ok "Docker instalado correctamente."
}

prepare_project() {
  if [[ -d "${PROJECT_DIR}/.git" ]]; then
    log_info "Actualizando proyecto en ${PROJECT_DIR}..."
    git -C "${PROJECT_DIR}" pull --rebase
  else
    log_info "Clonando proyecto en ${PROJECT_DIR}..."
    git clone "${REPO_URL}" "${PROJECT_DIR}"
  fi

  cd "${PROJECT_DIR}"

  if [[ ! -f ".env" ]]; then
    cp .env.example .env
    log_warn "Se creó .env desde .env.example. Ajusta ANTHROPIC_API_KEY antes de producción."
  fi
}

deploy() {
  detect_compose
  log_info "Desplegando servicios..."
  ${COMPOSE_CMD} up --build -d
  log_ok "Despliegue completado."
}

main() {
  echo "=================================================="
  echo " Chatbot VOIP - Instalación rápida de servidor"
  echo "=================================================="
  install_base_deps
  install_docker_if_needed
  prepare_project
  deploy
  echo
  log_ok "Servicios levantados:"
  echo "  Frontend: http://<IP-SERVIDOR>:3001"
  echo "  Backend : http://<IP-SERVIDOR>:3000/health"
  echo
  log_info "Comando útil: cd ${PROJECT_DIR} && ${COMPOSE_CMD} logs -f"
}

main "$@"
