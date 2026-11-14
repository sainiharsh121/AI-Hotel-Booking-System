// DRAFT: written from general knowledge, not checked on the ground.
// Names, descriptions and especially the distances need review by the hotel
// before this goes live. Distances are rough road distances from Sector 55,
// Gurgaon, and real travel times depend heavily on traffic.

export const SIGHTSEEING_REVIEWED = false;

export const PLACES = [
  {
    id: 'cyber-hub',
    name: 'Cyber Hub',
    km: 8,
    group: 'near',
    text: 'A dining and evening-out district in Cyber City, with restaurants, cafes and live music.'
  },
  {
    id: 'kingdom-of-dreams',
    name: 'Kingdom of Dreams',
    km: 9,
    group: 'near',
    text: 'A live-entertainment venue for theatre shows and Indian food, popular for evenings out.'
  },
  {
    id: 'sheetla-mata',
    name: 'Sheetla Mata Mandir',
    km: 10,
    group: 'near',
    text: 'A well-known temple in old Gurgaon, busy on festival days.'
  },
  {
    id: 'sultanpur',
    name: 'Sultanpur National Park',
    km: 25,
    group: 'day',
    text: 'A bird sanctuary on the edge of Gurgaon, best in the cooler months when migratory birds visit.'
  },
  {
    id: 'delhi',
    name: 'Delhi',
    km: 30,
    group: 'day',
    text: 'The capital is close by road, with its monuments, museums and markets.'
  },
  {
    id: 'damdama',
    name: 'Damdama Lake',
    km: 45,
    group: 'day',
    text: 'A large lake in the Aravalli foothills, used for boating and picnics.'
  }
];

export const GROUPS = [
  { key: 'near', title: 'In and around Gurgaon', blurb: 'A short drive from the hotel.' },
  { key: 'day', title: 'Day trips', blurb: 'Leave early to beat the traffic.' }
];
