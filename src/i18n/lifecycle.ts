import type { Locale } from "./config";
const en = {
  delete_home: "Delete home",
  delete_circle: "Delete circle",
  leave_circle: "Leave circle",
  delete_homeBody:
    "Permanently delete this home from all circles, including its availability, swap requests and related conversations. This cannot be undone.",
  delete_circleBody:
    "Permanently delete this circle for everyone, including its swap requests and related conversations. Members keep their homes. This cannot be undone.",
  leave_circleBody:
    "You will lose access to this circle and your homes will no longer be shared here. Your home records remain in My homes.",
  confirm: "Confirm",
  cancel: "Cancel",
  pending: "Saving…",
  error: "Could not complete this action. Please try again.",
  lastAdmin:
    "You are the last administrator. Another administrator must remain, or you can delete the circle instead.",
  unavailable:
    "This feature requires database migration 009. Please contact the administrator.",
  manage: "Manage",
  label: "Type the name to confirm",
  nameError: "The name does not match.",
};
const es: typeof en = {
  delete_home: "Eliminar casa",
  delete_circle: "Eliminar círculo",
  leave_circle: "Salir del círculo",
  delete_homeBody:
    "Elimina esta casa de todos los círculos, su disponibilidad, solicitudes de intercambio y conversaciones relacionadas. No se puede deshacer.",
  delete_circleBody:
    "Elimina este círculo para todos, sus solicitudes de intercambio y conversaciones relacionadas. Cada miembro conserva sus casas. No se puede deshacer.",
  leave_circleBody:
    "Perderás el acceso al círculo y tus casas dejarán de compartirse aquí. Sus fichas se conservan en Mis casas.",
  confirm: "Confirmar",
  cancel: "Cancelar",
  pending: "Guardando…",
  error: "No se pudo completar la acción. Inténtalo de nuevo.",
  lastAdmin:
    "Eres el último administrador. Debe quedar otro administrador, o puedes eliminar el círculo.",
  unavailable:
    "Esta función requiere la migración 009 de la base de datos. Contacta con el administrador.",
  manage: "Gestionar",
  label: "Escribe el nombre para confirmar",
  nameError: "El nombre no coincide.",
};
const ca: typeof en = {
  delete_home: "Eliminar casa",
  delete_circle: "Eliminar cercle",
  leave_circle: "Sortir del cercle",
  delete_homeBody:
    "Elimina aquesta casa de tots els cercles, la disponibilitat, les sol·licituds d’intercanvi i les converses relacionades. No es pot desfer.",
  delete_circleBody:
    "Elimina aquest cercle per a tothom, les sol·licituds d’intercanvi i les converses relacionades. Cada membre conserva les seves cases. No es pot desfer.",
  leave_circleBody:
    "Perdràs l’accés al cercle i les teves cases deixaran de compartir-s’hi. Les fitxes es conserven a Les meves cases.",
  confirm: "Confirmar",
  cancel: "Cancel·lar",
  pending: "Desant…",
  error: "No s’ha pogut completar l’acció. Torna-ho a provar.",
  lastAdmin:
    "Ets l’últim administrador. Hi ha de quedar un altre administrador, o pots eliminar el cercle.",
  unavailable:
    "Aquesta funció requereix la migració 009 de la base de dades. Contacta amb l’administrador.",
  manage: "Gestionar",
  label: "Escriu el nom per confirmar",
  nameError: "El nom no coincideix.",
};
export const lifecycleCopy = (locale: Locale) => ({ en, es, ca })[locale];
