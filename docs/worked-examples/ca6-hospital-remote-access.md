---
source: T Level Technical Qualification in Digital Software Development (Level 3), Core Examination Paper 2, Specimen Assessment Material for first teaching September 2025, Question 10
contentArea: 6
marks: 6
commandWord: Discuss
shape: two impacts × 3 marks (one positive, one negative), each developed as a complete N·E·I cycle
status: v2 with examiner marking commentary
score: 6/6
---

# Hospital server remote access

## Question

A hospital server contains sensitive medical information and must be available to authorised staff on a continuous basis. Some staff are able to access the server remotely over the internet from hospital-issued smartphones and laptops.

Discuss the potential impacts to the hospital of allowing staff to access this server remotely over the internet.

**[6 marks]**

## Model answer

One positive impact for the hospital is that authorised staff can access patient records at any time, including when they are away from the hospital site. Because the server is reachable over the internet from hospital-issued smartphones and laptops, on-call doctors and specialists responding from outside the hospital can retrieve sensitive medical information when they need it, rather than being blocked by having to be physically present at a workstation. This means the hospital can make faster clinical decisions in time-critical situations, for example when an on-call consultant reviews a patient's medical history before authorising treatment, which improves patient outcomes and helps the hospital meet its requirement for continuous availability of records.

One negative impact is that allowing access over the internet increases the hospital's exposure to cyber attacks on the server holding sensitive medical information. Each smartphone and laptop that can reach the server becomes a potential entry point for an attacker, so if a device is lost or stolen, or if a member of staff's credentials are compromised through phishing, the attacker can authenticate to the server in the same way an authorised user would. This creates the risk of a confidentiality breach affecting patient medical records, which would be a notifiable data breach under UK GDPR and could expose the hospital to regulatory action from the Information Commissioner's Office and significant reputational damage that undermines patient trust in how their data is handled.

## Examiner commentary

### What worked

This answer fully meets the requirements of the N·E·I cycle. It provides a balanced view with one well-developed positive and one well-developed negative impact, which is exactly what a Discuss command word rewards.

You have identified the 'so what' for every point you made. You didn't just say 'it's faster', you explained why that matters to a hospital. You didn't say just 'it's less secure', you explained the specific and legal repercussions. That habit of carrying every point through to a real-world consequence is what separates a 6-mark answer from a 4-mark answer on this kind of question.

### N·E·I structure breakdown

#### Impact 1: continuous availability (positive, 3 marks)

**Name.** "One positive impact for the hospital is that authorised staff can access patient records at any time, including when they are away from the hospital site."

Identifies a clear impact in scenario-anchored terms. The opening phrasing ("One positive impact for the hospital is that...") tells the examiner immediately what is being discussed and where it sits in the answer's structure.

**Explain.** "Because the server is reachable over the internet from hospital-issued smartphones and laptops, on-call doctors and specialists responding from outside the hospital can retrieve sensitive medical information when they need it, rather than being blocked by having to be physically present at a workstation."

Links the impact directly to specific details from the scenario (the smartphones and laptops, the internet access). The "rather than being blocked..." clause shows the mechanism by contrasting against the previous state, which makes the explanation concrete rather than abstract.

**Impact.** "This means the hospital can make faster clinical decisions in time-critical situations, for example when an on-call consultant reviews a patient's medical history before authorising treatment, which improves patient outcomes and helps the hospital meet its requirement for continuous availability of records."

Develops the consequence with a concrete clinical example and ties back to the scenario constraint (the requirement for continuous availability that was stated in the question stem). The student is rewarded for using the question's own framing as anchor for the impact.

#### Impact 2: cybersecurity exposure (negative, 3 marks)

**Name.** "One negative impact is that allowing access over the internet increases the hospital's exposure to cyber attacks on the server holding sensitive medical information."

Identifies a clear, distinct impact. Pairs naturally with the positive impact above (operational benefit vs. security cost), which gives the Discuss answer its balanced shape.

**Explain.** "Each smartphone and laptop that can reach the server becomes a potential entry point for an attacker, so if a device is lost or stolen, or if a member of staff's credentials are compromised through phishing, the attacker can authenticate to the server in the same way an authorised user would."

Explains the mechanism by which the risk increases. Names specific attack vectors (lost or stolen device, compromised credentials via phishing) rather than handwaving with "hackers". The "in the same way an authorised user would" clause is doing real work here: it explains why remote authentication is harder to defend than physical access controls.

**Impact.** "This creates the risk of a confidentiality breach affecting patient medical records, which would be a notifiable data breach under UK GDPR and could expose the hospital to regulatory action from the Information Commissioner's Office and significant reputational damage that undermines patient trust in how their data is handled."

Carries the impact through to legal and reputational consequences with specific named consequences (UK GDPR, ICO regulatory action). Strong answers on data-related questions earn marks for naming the relevant legal framework rather than just gesturing at "data laws".

### What to think about next time

A strong answer earned full marks. To push further on a similar question, two extensions are worth considering.

**Mitigation.** Briefly mention that while risks increase, the hospital can mitigate them using VPNs. The Discuss command word rewards balanced thinking, and acknowledging that the hospital has tools to manage the risk rather than just accept it shows a more mature analysis. A single clause inside the negative impact paragraph would be enough.

**Financial impact.** Think about the financial dimension. While remote access saves time, it also incurs costs for managing and securing a fleet of mobile devices. This could either be developed as a third impact or woven into one of the existing impacts as a counter-balance.

These extensions are not required for full marks on this question, but they show the kind of thinking that lifts a complete answer into a sophisticated one.
