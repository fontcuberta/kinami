#!/usr/bin/env bash
# Automatiza migraciones en Supabase y variables de entorno en Netlify.
#
# Requisitos (una sola vez):
#   1. Supabase: https://supabase.com/dashboard/account/tokens → crea un token
#      export SUPABASE_ACCESS_TOKEN="sbp_..."
#   2. Contraseña de la base de datos (Project Settings → Database)
#      export SUPABASE_DB_PASSWORD="..."
#   3. Netlify: https://app.netlify.com/user/applications → crea un token
#      export NETLIFY_AUTH_TOKEN="..."
#
# Uso:
#   chmod +x scripts/setup-remote.sh
#   ./scripts/setup-remote.sh
#
# Alternativa interactiva (abre el navegador):
#   npx supabase login
#   npx netlify-cli login

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_REF="vpfmioaegwemgdxjlmlv"
NETLIFY_SITE="kinami.netlify.app"

REDIRECT_URLS=(
  "https://kinami.app/auth/callback"
  "https://kinami.netlify.app/auth/callback"
  "http://localhost:3000/auth/callback"
)

echo "==> Kinami — configuración remota (Supabase + Netlify)"
echo

if [[ ! -f .env.local ]]; then
  echo "ERROR: falta .env.local (copia .env.local.example y rellénalo)."
  exit 1
fi

# --- Supabase: migraciones ---
echo "==> Supabase: comprobando acceso…"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  if npx supabase projects list >/dev/null 2>&1; then
    echo "    (sesión CLI detectada)"
  else
    echo "ERROR: no hay SUPABASE_ACCESS_TOKEN ni sesión de 'supabase login'."
    echo "  export SUPABASE_ACCESS_TOKEN=\"sbp_...\""
    echo "  o: npx supabase login"
    exit 1
  fi
fi

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "ERROR: falta SUPABASE_DB_PASSWORD (contraseña de Postgres del proyecto)."
  echo "  Supabase → Project Settings → Database → Database password"
  exit 1
fi

echo "    Enlazando proyecto $PROJECT_REF…"
npx supabase link --project-ref "$PROJECT_REF" --password "$SUPABASE_DB_PASSWORD" --yes

echo "    Aplicando migraciones (002, 003)…"
npx supabase db push --linked --yes

echo "    Comprobando tablas…"
npx supabase db query --linked --password "$SUPABASE_DB_PASSWORD" \
  "select to_regclass('public.swap_agreements') as swap_agreements, to_regprocedure('public.delete_own_account()') as delete_own_account;"

# --- Supabase: URLs de auth (Management API) ---
if [[ -n "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "==> Supabase: actualizando URLs de auth…"
  ALLOWLIST=$(IFS=,; echo "${REDIRECT_URLS[*]}")
  curl -sf -X PATCH "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"site_url\":\"https://kinami.app\",\"uri_allow_list\":\"${ALLOWLIST}\"}" \
    >/dev/null
  echo "    Site URL y Redirect URLs actualizados."
else
  echo "==> Supabase: omite URLs de auth (necesitas SUPABASE_ACCESS_TOKEN para la API)."
  echo "    Añádelas a mano en Authentication → URL Configuration:"
  printf '    - %s\n' "${REDIRECT_URLS[@]}"
fi

# --- Netlify: variables de entorno ---
echo
echo "==> Netlify: comprobando acceso…"

if [[ -z "${NETLIFY_AUTH_TOKEN:-}" ]]; then
  if npx netlify-cli status >/dev/null 2>&1; then
    echo "    (sesión CLI detectada)"
  else
    echo "ERROR: no hay NETLIFY_AUTH_TOKEN ni sesión de 'netlify login'."
    echo "  export NETLIFY_AUTH_TOKEN=\"...\""
    echo "  o: npx netlify-cli login"
    exit 1
  fi
fi

echo "    Importando variables desde .env.local…"
npx netlify-cli env:import --site "$NETLIFY_SITE" .env.local

echo "    Disparando redeploy (conectado a GitHub si aplica)…"
npx netlify-cli build --site "$NETLIFY_SITE" 2>/dev/null || true
npx netlify-cli deploy --site "$NETLIFY_SITE" --prod --message "setup-remote: env + migrations" 2>/dev/null \
  || echo "    (Si el sitio despliega desde GitHub, haz git push para aplicar las variables.)"

echo
echo "✓ Listo."
echo "  - Migraciones aplicadas en Supabase"
echo "  - Variables en Netlify + redeploy"
echo "  - Prueba el login en https://kinami.netlify.app/login"
echo "  (Si ves 'rate limit', espera ~60 min — Supabase limita emails/hora en plan gratis)"
