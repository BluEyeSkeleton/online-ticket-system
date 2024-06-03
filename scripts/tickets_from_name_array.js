// Imports
const Ticket = require("../classes/ticket");
const TicketDatabase = require("../util/ticket-db");

const NAMES = [
  "CHAN JUN HONG",
  "NG JING XI",
  "TAN ZUN ZHE",
  "BENJAMIN LEONG KUN FUNG",
  "WAN HAO YIN",
  "WONG PIN MING",
  "TONG ZEE KENN",
  "LIM HOM ZE",
  "CHAI NEN QUAN",
  "YEOH JIE CHENG",
  "KOEK YIK ONN",
  "EWE KWAN JED",
  "NG KAI CHEN",
  "GERALD ONG E-GENE",
  "RYAN CHEONG ZU YEE",
  "CHANG JIA SHENG",
  "KOAY CHEN TATT",
  "LIM HONG MING",
  "LIM CHEN YEH",
  "OOI JENG YEW",
  "LEU JIA LE",
  "LIM ZHI XUE",
  "LIM YUTO",
  "CHEW WEI YEH",
  "LIM KUI YAN",
  "TAN JIN XIAN",
];

console.log("started");
for (let i = 0; i < NAMES.length; i++) {
  console.log(`handling ticket for ${NAMES[i]}`);
  const ticket = new Ticket();
  ticket.configFields({
    type: "student",
    name: NAMES[i],
    icNo: "-",
  });
  TicketDatabase.addTicket(
    ticket,
    `${i + 1}`.length > 1 ? `50${i + 1}` : `500${i + 1}`
  );
}
console.log("done");
