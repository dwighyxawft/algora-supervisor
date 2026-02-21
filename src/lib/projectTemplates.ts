export interface ProjectTemplate {
  name: string;
  label: string;
  zipUrl: string;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  { name: 'angular-tailwind-cli', label: 'Angular + Tailwind', zipUrl: 'https://drive.google.com/uc?export=download&id=1p96nDYJ9r3cMsxaWlGYSvvQINwFYl5TU' },
  { name: 'deep-learning', label: 'Deep Learning (Python)', zipUrl: 'https://drive.google.com/uc?export=download&id=1oi4WMlbP4EToOu6Ny2Dr-GTnxKWmOkjI' },
  { name: 'jupyter-ml', label: 'Jupyter ML', zipUrl: 'https://drive.google.com/uc?export=download&id=13hHNjPdDXx-EvTG0WLccGsoFcUyhT_la' },
  { name: 'laravel-api', label: 'Laravel API', zipUrl: 'https://drive.google.com/uc?export=download&id=1KiN5Pi5H-VsN_NfaxN_fPjC4IB4dlDhn' },
  { name: 'nestjs-cli', label: 'NestJS CLI', zipUrl: 'https://drive.google.com/uc?export=download&id=1KLQuiLRG7hDX77S951dy_a_9JwMr2FBk' },
  { name: 'nextjs-cli', label: 'Next.js CLI', zipUrl: 'https://drive.google.com/uc?export=download&id=1SgAbxT4mXkpnc1v9-gzEar3u7SQQLYqi' },
  { name: 'node-express-ejs', label: 'Node + Express + EJS', zipUrl: 'https://drive.google.com/uc?export=download&id=1GD55o9-XjlWrzvewmVs-ReZFqAjuuTkT' },
  { name: 'php-backend', label: 'PHP Backend', zipUrl: 'https://drive.google.com/uc?export=download&id=1iW2-otnD2Ac0_stqKJzqgfSIz_X1yy6J' },
  { name: 'react-tailwind-ts', label: 'React + Tailwind + TS', zipUrl: 'https://drive.google.com/uc?export=download&id=1clLMrsXKrzzcwS5PuU40ESCTc0PwQaLO' },
  { name: 'static-html-css-js', label: 'Static HTML/CSS/JS', zipUrl: 'https://drive.google.com/uc?export=download&id=1B8fcs5VQ2XeHiSpX-fvhrPxG0_Xc2UoX' },
  { name: 'vuejs-cli', label: 'Vue.js CLI', zipUrl: 'https://drive.google.com/uc?export=download&id=13_YRAlx69WTMVd8QVzSHzZ1Pp2NJYTQz' },
];
