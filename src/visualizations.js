import data from './viz-data.json';

export function initVisualizations(scope) {
  const $ = id => scope.querySelector(`#${id}`);
  const format = value => Number(value).toLocaleString('en-US');
  const seats = ['Business Class', 'Economy Class', 'First Class', 'Premium Economy'];

  const renderBA = () => {
    const selected = $('seat-filter').value;
    const group = data.ba.groups[selected];
    $('ba-title').textContent = selected === 'All' ? 'All classes' : selected;
    $('ba-count').textContent = format(group.count);
    $('ba-rating').textContent = (group.rating_sum / group.rating_count).toFixed(1);
    $('ba-recommend').textContent = `${Math.round(group.yes / group.count * 100)}%`;
    const yesShare = group.yes / group.count * 100;
    $('ba-morph-group').textContent = selected === 'All' ? 'ALL CLASSES' : selected.toUpperCase();
    $('ba-yes-label').textContent = `${Math.round(yesShare)}%`;
    $('ba-no-label').textContent = `${Math.round(100 - yesShare)}%`;
    $('ba-yes-bar').style.width = `${yesShare}%`;
    $('ba-no-bar').style.width = `${100 - yesShare}%`;
    $('ba-morph-summary').textContent = `${format(group.yes)} of ${format(group.count)} reviews recommended British Airways.`;
    $('ba-bars').innerHTML = seats.map(seat => {
      const row = data.ba.groups[seat];
      const average = row.rating_sum / row.rating_count;
      const faded = selected !== 'All' && selected !== seat ? 'opacity:.45;' : '';
      return `<div class="bar-row" style="${faded}"><span>${seat}</span><div class="bar-track"><div class="bar-fill" style="width:${average * 10}%"></div></div><b>${average.toFixed(1)}</b></div>`;
    }).join('');
  };
  $('seat-filter').addEventListener('change', renderBA);
  renderBA();

  const years = data.bird.years;
  const total = data.bird.total;
  const maximum = Math.max(...years.map(row => row.count));
  const px = i => 38 + i * (625 / (years.length - 1));
  const py = count => 235 - count / maximum * 186;
  const points = years.map((row, i) => `${px(i)},${py(row.count)}`).join(' ');
  const area = `38,235 ${points} 663,235`;
  const renderBird = () => {
    const year = Number($('bird-year').value);
    const row = years[year - 1990];
    $('bird-year-label').textContent = year;
    $('bird-count').textContent = format(row.count);
    $('bird-share').textContent = `${(row.count / total * 100).toFixed(1)}%`;
    $('bird-total').textContent = format(total);
    $('bird-trend').innerHTML = `<line class="grid" x1="38" y1="235" x2="663" y2="235"/><line class="grid" x1="38" y1="142" x2="663" y2="142"/><line class="grid" x1="38" y1="49" x2="663" y2="49"/><polygon class="trend-area" points="${area}"/><polyline class="trend-line" points="${points}"/><line x1="${px(year - 1990)}" y1="${py(row.count)}" x2="${px(year - 1990)}" y2="235" stroke="#dc7957" stroke-width="1.5" stroke-dasharray="4 5"/><circle cx="${px(year - 1990)}" cy="${py(row.count)}" r="7"/><text x="38" y="262" fill="#667c6e" font-size="13">1990</text><text x="620" y="262" fill="#667c6e" font-size="13">2020</text>`;
    $('bird-trend').setAttribute('aria-label', `Bird strike reports from 1990 to 2020. ${format(row.count)} reports in ${year}.`);
  };
  $('bird-year').addEventListener('input', renderBird);
  renderBird();
  const phases = Object.entries(data.bird.phases).filter(([name]) => name !== 'Unspecified').slice(0, 5);
  const phaseMax = Math.max(...phases.map(([, count]) => count));
  $('phase-bars').innerHTML = phases.map(([name, count]) => `<div class="bar-row"><span>${name}</span><div class="bar-track"><div class="bar-fill" style="width:${count / phaseMax * 100}%"></div></div><b>${Math.round(count / 1000)}k</b></div>`).join('');
}
