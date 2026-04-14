// populate.js
// Usage:
//   npm install pocketbase
//   PB_URL=http://127.0.0.1:8090 PB_ADMIN=you@example.com PB_PASS=yourpass node populate.js
//
// Populates: devices, patients, recordings, consultations, conversations, messages, notifications
// Reuses existing users, respirai_audio, and respirai_results records by ID.

import PocketBase from "pocketbase";

const pb = new PocketBase(
  process.env.PB_URL || "https://pocketbase.lukaxzs.myaddr.io",
);

// ---- existing IDs (from your screenshots) ----
const USER_PATIENT = "da5avv81x3ev862"; // test@user.com
const USER_DOCTOR = "mbn289nuruwmuqh"; // test@doctor.com

const AUDIO = {
  wheezes: "y5ajbzk9ppebljm",
  normal1: "675o54wpe9iwz82",
  normal2: "ss5k4v992zodai8",
};

const RESULT = {
  wheezes: "da5i6983usdbe9i",
  normal1: "xoxcj0zu75n52lj",
  normal2: "5106g4829wuibtd",
};

async function main() {
  await pb
    .collection("_superusers")
    .authWithPassword(process.env.PB_ADMIN, process.env.PB_PASS);

  // ---- devices ----
  const device = await pb.collection("devices").create({
    device_code: "QR-STETH-0001",
    name: "Stethoscope Pro",
    model: "RespirAI-X1",
    firmware_version: "1.2.3",
    owner: USER_DOCTOR,
    status: "active",
    last_seen: new Date().toISOString(),
  });
  console.log("device", device.id);

  // ---- patients ----
  const patients = [];
  const patientSeed = [
    {
      full_name: "John Doe",
      gender: "male",
      dob: "1979-05-12",
      status: "review",
    },
    {
      full_name: "Jane Smith",
      gender: "female",
      dob: "1992-11-03",
      status: "normal",
    },
    {
      full_name: "Robert Brown",
      gender: "male",
      dob: "1967-02-21",
      status: "follow_up",
    },
    {
      full_name: "Sarah Miller",
      gender: "female",
      dob: "1980-07-30",
      status: "follow_up",
    },
    {
      full_name: "Michael Park",
      gender: "male",
      dob: "2004-09-14",
      status: "normal",
    },
  ];
  for (const p of patientSeed) {
    const rec = await pb.collection("patients").create({
      doctor: USER_DOCTOR,
      full_name: p.full_name,
      gender: p.gender,
      date_of_birth: p.dob,
      medical_history: "<p>No significant prior conditions.</p>",
      status: p.status,
    });
    patients.push(rec);
    console.log("patient", rec.id, p.full_name);
  }

  // ---- recordings (tie patient ↔ audio ↔ result) ----
  const recordingSeed = [
    {
      patient: patients[0].id,
      audio: AUDIO.wheezes,
      result: RESULT.wheezes,
      location: "at_hospital",
      body_position: "mitral",
      diagnosis_title: "Wheezes Detected",
      severity: "high",
      confidence: 92,
      confirmed: true,
      doctor_note:
        "<p>Clear wheezing on mitral auscultation. Recommend follow-up.</p>",
    },
    {
      patient: patients[1].id,
      audio: AUDIO.normal1,
      result: RESULT.normal1,
      location: "at_home",
      body_position: "aortic",
      diagnosis_title: "Normal Sinus Rhythm",
      severity: "normal",
      confidence: 88,
      confirmed: true,
      doctor_note: "<p>Lungs clear, no abnormal sounds.</p>",
    },
    {
      patient: patients[2].id,
      audio: AUDIO.normal2,
      result: RESULT.normal2,
      location: "clinic_visit",
      body_position: "pulmonic",
      diagnosis_title: "Normal Sinus Rhythm",
      severity: "normal",
      confidence: 85,
      confirmed: false,
      doctor_note: "<p>Routine check, nothing of note.</p>",
    },
  ];
  const recordings = [];
  for (const r of recordingSeed) {
    const rec = await pb.collection("recordings").create({
      ...r,
      doctor: USER_DOCTOR,
    });
    recordings.push(rec);
    console.log("recording", rec.id);
  }

  // ---- consultations ----
  const consultSeed = [
    {
      patient: patients[0].id,
      title: "Heart Rhythm Analysis",
      when: "+1d",
      type: "video_call",
      status: "scheduled",
    },
    {
      patient: patients[1].id,
      title: "Follow-up Review",
      when: "+3d",
      type: "voice_call",
      status: "scheduled",
    },
    {
      patient: patients[2].id,
      title: "Lung Sound Review",
      when: "+7d",
      type: "in_person",
      status: "scheduled",
    },
  ];
  for (const c of consultSeed) {
    const days = parseInt(c.when);
    const when = new Date(Date.now() + days * 86400000).toISOString();
    const rec = await pb.collection("consultations").create({
      patient: c.patient,
      doctor: USER_DOCTOR,
      title: c.title,
      scheduled_at: when,
      type: c.type,
      status: c.status,
      notes: "<p>Prepared by AI analysis.</p>",
    });
    console.log("consultation", rec.id);
  }

  // ---- conversations + messages ----
  const convo = await pb.collection("conversations").create({
    participants: [USER_DOCTOR, USER_PATIENT],
    last_message_at: new Date().toISOString(),
    last_message_preview: "I've uploaded the new heart sound recording.",
  });
  console.log("conversation", convo.id);

  const msgSeed = [
    {
      sender: USER_PATIENT,
      body: "Hi doctor, I've uploaded the new heart sound recording.",
    },
    { sender: USER_DOCTOR, body: "Thanks, I will review it shortly." },
    {
      sender: USER_PATIENT,
      body: "Also, the medication is working well — feeling much better.",
    },
  ];
  for (const m of msgSeed) {
    const rec = await pb.collection("messages").create({
      conversation: convo.id,
      sender: m.sender,
      body: m.body,
      read_by: [m.sender],
    });
    console.log("message", rec.id);
  }

  // ---- notifications ----
  const notifSeed = [
    {
      type: "recording_ready",
      title: "New recording analyzed",
      body: "Wheezes detected for John Doe",
      link: recordings[0].id,
    },
    {
      type: "message",
      title: "New message",
      body: "test@user.com sent you a message",
      link: convo.id,
    },
    {
      type: "consultation",
      title: "Upcoming consultation",
      body: "Heart Rhythm Analysis tomorrow at 2:00 PM",
      link: "",
    },
  ];
  for (const n of notifSeed) {
    const rec = await pb.collection("notifications").create({
      user: USER_DOCTOR,
      ...n,
      read: false,
    });
    console.log("notification", rec.id);
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
