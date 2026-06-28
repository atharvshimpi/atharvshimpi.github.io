import type { RecognitionEntry, AwardEntry } from '../types'

export const recognition: RecognitionEntry[] = [
  {
    value: '1st',
    label: 'Aurigo Hackathon',
    sub: 'Secured first place out of 32 competing teams in a company-wide hackathon.',
  },
  {
    value: 'Top 0.5%',
    label: 'BITSAT',
    sub: 'Scored 349/450, placing in the top 0.5 percentile.',
  },
  {
    value: 'Top 0.375%',
    label: 'MHT-CET Rank',
    sub: 'Secured rank 1,500 out of 4 lakh people.',
  },
  {
    value: '18,780',
    label: 'JEE Advanced Rank',
    sub: 'All-India Rank out of 2 lakh candidates.',
  },
]

export const awards: AwardEntry[] = [
  {
    emoji: '🏅',
    label: 'Spot Award',
    description:
      'Nominated for exemplifying a growth mindset by proactively owning project tasks, quickly acquiring new skills, supporting critical deliveries, and ensuring high-quality outputs through continuous learning, dedication, and a strong sense of initiative.',
    org: 'Aurigo',
    certificateUrl: 'assets/awards/Spotlight Award Akshata.pdf',
  },
  {
    emoji: '🏅',
    label: 'Spot Award',
    description:
      'Demonstrated an outstanding proactive approach in bug analysis, ensuring timely identification and resolution. With consistent and prompt updates, eliminated the need for follow-ups, showcasing dedication and reliability.',
    org: 'Aurigo',
    certificateUrl: 'assets/awards/Spotlight Award Lakshmi.pdf',
  },
  {
    emoji: '🥇',
    label: 'Bravo Award',
    description:
      'Received for going above and beyond in delivering a high-impact feature ahead of schedule.',
    org: 'Aurigo',
    certificateUrl: 'assets/awards/Bravo Award Harish.pdf',
  },
  {
    emoji: '🏆',
    label: 'Hackathon Winner',
    description:
      "Secured 1st place out of 32 teams in Aurigo's company-wide hackathon.",
    org: 'Aurigo',
    certificateUrl: 'assets/awards/Hackathon Champions.pdf',
  },
  {
    emoji: '🤝',
    label: 'Team Award',
    description:
      'Great team collaboration to deliver amazing value and benefits to customers. The team worked hard to pull an amazing product launch that was well received by all customers at the AOS Summit.',
    org: 'Aurigo',
    certificateUrl: 'assets/awards/Team Award Masterworks.pdf',
  },
]
