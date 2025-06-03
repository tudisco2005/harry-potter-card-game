// place files you want to import through the `$lib` alias in this folder.
export function formattDate(dataISO) {
  const data = new Date(dataISO);
  
  // Estrai i componenti
  const ore = data.getHours().toString().padStart(2, '0');
  const minuti = data.getMinutes().toString().padStart(2, '0');
  const giorno = data.getDate().toString().padStart(2, '0');
  const mese = (data.getMonth() + 1).toString().padStart(2, '0'); // +1 perché getMonth() restituisce 0-11
  const anno = data.getFullYear();
  
  return `${ore}:${minuti} il ${giorno}/${mese}/${anno}`;
}