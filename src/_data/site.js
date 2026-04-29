export default {
  title: 'NewPlace2Frown',
  tagline: 'Documentary photography by Leon Morgan',
  url: 'https://newplace2frown.com',
  shopUrl: 'https://shop.newplace2frown.com',
  formspreeEndpoint: 'https://formspree.io/f/mjglbenq',
  author: {
    name: 'Leon Morgan',
    email: 'newplace2frown@gmail.com'
  },
  nav: [
    { label: 'Work',     href: '/work/' },
    {
      label: 'Projects', href: '/projects/',
      children: [
        { label: 'Morecambe',          href: '/projects/morecambe/' },
        { label: 'The Gambia, 2019',   href: '/projects/gambia-2019/' },
        { label: 'The Gambia, 2023',   href: '/projects/gambia-2023/' },
        { label: 'Lancaster',          href: '/projects/lancaster/' },
        { label: 'Cardiff',            href: '/projects/cardiff/' },
        { label: 'West Wales',         href: '/projects/wales/' }
      ]
    },
    { label: 'Journal',  href: '/journal/' },
    { label: 'Prints',   href: '/prints/' },
    { label: 'About',    href: '/about/' },
    { label: 'Contact',  href: '/contact/' }
  ],
  socials: [
    { label: 'Instagram',  href: 'https://instagram.com/le.on_photos' },
    { label: 'Subsurface', href: 'https://subsurfaces.net' },
    { label: 'Twitter',    href: 'https://twitter.com/newplace2frown' },
    { label: 'TikTok',     href: 'https://www.tiktok.com/@newplace2frown' },
    { label: 'SoundCloud', href: 'https://soundcloud.com/m0rvidd' }
  ]
};
