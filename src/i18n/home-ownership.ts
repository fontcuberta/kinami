import type { Locale } from "./config";
const es = {
  formerCircle: "Círculo del que ya no formas parte",
  title: "Mis casas",
  intro: "Cada casa, una sola ficha. Tú decides en qué círculos compartirla.",
  create: "Añadir una casa",
  createIntro:
    "Guarda primero los datos de tu casa. Después podrás compartirla en uno o varios círculos.",
  manage: "Ver y gestionar",
  edit: "Editar información",
  sharing: "Dónde compartes esta casa",
  sharingBody:
    "La información y la disponibilidad son las mismas en todos los círculos. Retirar la casa de uno no la borra ni la retira de los demás.",
  unshared: "Sin compartir en círculos",
  shared: "Compartida en este círculo",
  hidden: "No compartida aquí",
  share: "Compartir aquí",
  remove: "Retirar de este círculo",
  saving: "Guardando…",
  saved: "Visibilidad actualizada",
  circleManage: "Mis casas en este círculo",
  circleManageBody:
    "Elige cuáles de tus casas quieres compartir con estas personas. Retirarlas del círculo no elimina sus fichas ni los intercambios existentes.",
  circleAction: "Gestionar mis casas aquí",
  empty: "Tus casas empiezan aquí.",
  emptyBody:
    "Añade tu primera casa, completa su ficha y decide con quién compartirla.",
  noCircles:
    "Aún no perteneces a ningún círculo real. Puedes guardar tu casa y compartirla más adelante.",
  circles: "Ver mis círculos",
  back: "Volver a mis casas",
  newTab: "Mis casas",
  privateNote:
    "Esta casa no aparece en la búsqueda de ningún círculo hasta que la compartas.",
  savedShare: "Tu casa está guardada. Ahora puedes elegir dónde compartirla.",
  available: "Disponibilidad",
  info: "Información de la casa",
  photos: "Fotos",
  equipment: "Equipamiento",
  manual: "Guía de la casa",
  sharingCount: "Círculos en los que se comparte",
  choose: "Elige una casa existente o añade una nueva a Mis casas.",
};
type Copy = { [K in keyof typeof es]: string };
const en: Copy = {
  formerCircle: "A circle you have left",
  title: "My homes",
  intro: "One home, one listing. You choose which circles to share it with.",
  create: "Add a home",
  createIntro:
    "Save your home’s details first. Then choose one or more circles to share it with.",
  manage: "View and manage",
  edit: "Edit details",
  sharing: "Where you share this home",
  sharingBody:
    "Details and availability are the same across circles. Removing a home from one circle does not delete it or remove it from the others.",
  unshared: "Not shared with any circles",
  shared: "Shared with this circle",
  hidden: "Not shared here",
  share: "Share here",
  remove: "Remove from this circle",
  saving: "Saving…",
  saved: "Sharing updated",
  circleManage: "My homes in this circle",
  circleManageBody:
    "Choose which of your homes to share with these people. Removing them from the circle does not delete their listings or existing exchanges.",
  circleAction: "Manage my homes here",
  empty: "Your homes start here.",
  emptyBody:
    "Add your first home, complete its details and choose who to share it with.",
  noCircles:
    "You haven’t joined a real circle yet. You can save your home and share it later.",
  circles: "View my circles",
  back: "Back to my homes",
  newTab: "My homes",
  privateNote:
    "This home won’t appear in any circle’s search until you share it.",
  savedShare: "Your home is saved. Now choose where to share it.",
  available: "Availability",
  info: "Home details",
  photos: "Photos",
  equipment: "Amenities",
  manual: "House guide",
  sharingCount: "Circles sharing this home",
  choose: "Choose an existing home or add a new one to My homes.",
};
const ca: Copy = {
  formerCircle: "Cercle del qual ja no formes part",
  title: "Les meves cases",
  intro:
    "Cada casa, una sola fitxa. Tu decideixes en quins cercles compartir-la.",
  create: "Afegeix una casa",
  createIntro:
    "Desa primer les dades de casa teva. Després podràs compartir-la en un o més cercles.",
  manage: "Veure i gestionar",
  edit: "Edita la informació",
  sharing: "On comparteixes aquesta casa",
  sharingBody:
    "La informació i la disponibilitat són les mateixes a tots els cercles. Retirar la casa d’un cercle no l’esborra ni la retira dels altres.",
  unshared: "Sense compartir en cercles",
  shared: "Compartida en aquest cercle",
  hidden: "No compartida aquí",
  share: "Comparteix aquí",
  remove: "Retira d’aquest cercle",
  saving: "Desant…",
  saved: "Visibilitat actualitzada",
  circleManage: "Les meves cases en aquest cercle",
  circleManageBody:
    "Tria quines cases vols compartir amb aquestes persones. Retirar-les del cercle no elimina les fitxes ni els intercanvis existents.",
  circleAction: "Gestiona les meves cases aquí",
  empty: "Les teves cases comencen aquí.",
  emptyBody:
    "Afegeix la primera casa, completa’n la fitxa i decideix amb qui compartir-la.",
  noCircles:
    "Encara no pertanys a cap cercle real. Pots desar casa teva i compartir-la més endavant.",
  circles: "Veure els meus cercles",
  back: "Torna a les meves cases",
  newTab: "Les meves cases",
  privateNote:
    "Aquesta casa no apareixerà a la cerca de cap cercle fins que la comparteixis.",
  savedShare: "La casa està desada. Ara pots triar on compartir-la.",
  available: "Disponibilitat",
  info: "Informació de la casa",
  photos: "Fotos",
  equipment: "Equipament",
  manual: "Guia de la casa",
  sharingCount: "Cercles on es comparteix",
  choose: "Tria una casa existent o afegeix-ne una a Les meves cases.",
};
export const homeOwnershipCopy = (locale: Locale): Copy =>
  ({ es, en, ca })[locale];
