import Current from '@/libs/current.js';

const current = new Current({
  selector: '.l-header-nav-list a',
  level: 1,
});
current.init();