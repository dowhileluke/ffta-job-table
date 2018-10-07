function makeGradient(colors, length) {
  function hex2int(h) {
    const v = parseInt(h, 16);
    return (h.length == 1) ? (v * 17) : v;
  };

  function hex2rgb(h) {
    const v = h.replace('#', '');
    const l = v.length / 3;

    return {
      r: hex2int(v.slice(    0, l    )),
      g: hex2int(v.slice(l    , l * 2)),
      b: hex2int(v.slice(l * 2, l * 3)),
    };
  };

  const int2hex = i => ('0' + i.toString(16)).slice(-2);
  const rgb2hex = c => '#' + int2hex(c.r) + int2hex(c.g) + int2hex(c.b);

  const mix = (a, b, pct) => Math.floor(a * pct + b * (1 - pct));
  const blend = (c1, c2, pct) => rgb2hex({
    r: mix(c1.r, c2.r, pct),
    g: mix(c1.g, c2.g, pct),
    b: mix(c1.b, c2.b, pct),
  });

  const rgbColors = colors.map(c => hex2rgb(c));
  const sections = [];
  const sectionCount = colors.length - 1;
  const sectionLength = Math.floor((length - 1) / sectionCount);
  const remainder = (length - 1) % sectionLength;

  for (let i = 0; i < sectionCount; i++) {
    sections.push({
      color1: rgbColors[i],
      color2: rgbColors[i + 1],
      length: (i < remainder) ? (sectionLength + 1) : sectionLength,
    });
  };

  const results = [rgb2hex(rgbColors[0])];

  sections.forEach(function (s) {
    const len = s.length;

    for (let i = 1; i <= len; i++) {
      results.push(blend(s.color1, s.color2, (len - i) / len));
    };
  });

  return results;
};

// console.log(makeGradient(['#f00', '#fff', '#080'], 11));

function Gradient({ colors, length, children }) {
  const gradient = makeGradient(colors, length);

  return React.Children.map(children, c => React.cloneElement(c, { gradient, }));
};
