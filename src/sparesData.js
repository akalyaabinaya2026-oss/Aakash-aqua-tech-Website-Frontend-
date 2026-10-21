// Spares: tabs + products, taken from https://aakashaquatech.in/spares/
const IMG = 'https://aakashaquatech.in/wp-content/uploads/2026/05/'
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// [key, label shown in the left list]
export const spareTabs = [
  ['inline', 'INLINE FILTER CARTRIDGE'],
  ['alkaline', 'ALKALINE FILTER'],
  ['membrane', 'MEMBRANE ELEMENT'],
  ['prefilter', 'PRE FILTER HOUSING'],
  ['memhousing', 'MEMBRANE HOUSING'],
  ['float', 'FLOAT VALVE'],
  ['smps', 'SMPS'],
  ['booster', 'BOOSTER PUMP'],
  ['teflon', 'TEFLON TAPE'],
  ['uvled', 'UV LED OLIVAR'],
  ['solenoid', 'SOLENOID VALVE'],
  ['pp', 'PP SPUN FILTER'],
  ['kit', 'REPLACABLE FILTER CARTRIDGE KIT'],
  ['uvchamber', 'UV CHAMBER'],
  ['mineral', 'MINERAL CARTRIDGE'],
  ['uf', 'UF MEMBRANE'],
]

// [tab, product name, image file, price, max price (only when the live site shows a range)]
const rows = [
  ['inline', 'CYCLONE - INLINE FILTER CARTRIDGE', 'Untitled-4-03-300x300.png', 499],
  ['inline', 'STORM - INLINE FILTER CARTRIDGE', 'Untitled-4-02-300x300.png', 599],
  ['inline', 'THUNDER - INLINE FILTER CARTRIDGE', 'Untitled-4-01-300x300.png', 699],
  ['inline', 'VOLCANO - INLINE FILTER CARTRIDGE', 'VOLCANO-300x300.jpg', 699],
  ['inline', 'TORNADO - INLINE FILTER CARTRIDGE', 'TORNADO-300x300.jpg', 799],

  ['alkaline', 'CYCLONE - ALKALINE FILTER', 'Cyclone20Alkaline20Inline-300x300.png', 1499],
  ['alkaline', 'STORM - ALKALINE FILTER', 'Storm20Alkaline20Inline-300x300.png', 1699],
  ['alkaline', 'THUNDER - ALKALINE FILTER', 'Thunder20Alkaline20Inline-300x300.png', 1999],
  ['alkaline', 'CYCLONE 3 IN 1 COPPER ALKALINE ZINC - ALKALINE FILTER', 'Copper20Alkaline20Inline-300x300.png', 1999],

  ['membrane', 'CYCLONE - MEMBRANE ELEMENT', 'membrane20cyclone208020GPD20new20color-300x300.png', 1999, 2999],
  ['membrane', 'STORM - MEMBRANE ELEMENT', 'MEMBRANE20Storm2080-300x300.png', 2499, 3999],
  ['membrane', 'THUNDER - MEMBRANE ELEMENT', 'Membraine20Thunder2080-300x300.png', 2999],

  ['prefilter', 'STORM - PRE FILTER HOUSING', 'Untitled-10-04-300x300.png', 2999],
  ['prefilter', 'CYCLONE - PRE FILTER HOUSING', 'cyclone20bowl-300x300.jpg', 699],

  ['memhousing', 'CYCLONE - MEMBRANE HOUSING', 'Strom20Membrane20housing-300x300.png', 499],
  ['memhousing', 'THUNDER - MEMBRANE HOUSING', 'Untitled-5-01-300x300.png', 599],

  ['float', 'CYCLONE - FLOAT VALVE', 'Untitled-3-06-02-300x300.png', 299],
  ['float', 'STORM - FLOAT VALVE', 'Untitled-3-06-03-300x300.png', 299],
  ['float', 'THUNDER - FLOAT VALVE', 'Untitled-3-06-01-300x300.png', 299],

  ['smps', 'THUNDER - SMPS', 'Untitled-12-02-300x300.png', 999],
  ['smps', 'TORNADO - SMPS', 'TORNADO-1-300x300.jpg', 1199],

  ['booster', 'CYCLONE - BOOSTER PUMP', 'Cyclone-300x300.png', 2699],
  ['booster', 'STORM - BOOSTER PUMP', 'Storm2010020new-300x300.png', 2999],
  ['booster', 'THUNDER - BOOSTER PUMP', 'Thunder20300-300x300.png', 3499, 4599],
  ['booster', 'VOLCANO - BOOSTER PUMP', 'VOLCANO_PUMP.481-300x300.png', 3299],

  ['teflon', 'THUNDER - TEFLON TAPE', 'Asset203-100-300x300.png', 39],
  ['uvled', 'UV LED OLIVAR - UV LED OLIVAR', 'uv20led-300x300.png', 249],
  ['solenoid', 'STORM - SOLENOID VALVE', 'Untitled-13-02-300x300.png', 599],

  ['pp', 'CYCLONE - PP SPUN FILTER', 'Cyclone20PP-300x300.png', 249],
  ['pp', 'STORM - PP SPUN FILTER', 'Strom20PP-300x300.png', 299, 699],
  ['pp', 'THUNDER - PP SPUN FILTER', 'Thunder20PP-300x300.png', 349],

  ['kit', 'THUNDER - REPLACABLE FILTER CARTRIDGE KIT', 'Thunder20Replacable20Filter-300x300.png', null], // no price on the live site

  ['uvchamber', 'STORM - UV CHAMBER', 'UV20Chamber20stroma-300x300.png', 599],
  ['uvchamber', 'THUNDER - UV CHAMBER', 'Thunder20UV20Chamber-300x300.png', 799],

  ['mineral', 'Mineral Cartridge 4 Inch - MINERAL CARTRIDGE', 'mineral20cartridge20420Inch-300x300.png', 299, 499],
  ['mineral', 'Mineral Cartridge 8 Inch - MINERAL CARTRIDGE', 'mineral20cartridge-300x300.png', 299, 499],

  ['uf', 'Olivar - UF MEMBRANE', 'uf20membrane-300x300.png', 599],
]

export const spares = rows.map(([cat, name, file, price, max]) => ({
  cat,
  name,
  img: IMG + file,
  price,
  max,
  slug: slug(name),
  url: 'https://aakashaquatech.in/product/' + slug(name) + '/',
}))

export const findSpare = (sl) => spares.find((x) => x.slug === sl)

// Description, feature list and technical rows shared by every product of a spare category (shown on /spare/<slug>)
export const spareInfo = {
  inline: {
    label: 'Inline Filter Cartridge',
    about: [
      'The inline filter cartridge is fitted in the water line of your RO purifier and removes the chlorine, odour, colour and fine impurities left after the main stages, so the water that reaches your glass tastes fresh and clean.',
      'A genuine Olivar cartridge keeps the purifier performing at its best. Replace it on schedule to protect the RO membrane and keep the taste consistent.',
    ],
    features: ['Improves taste and removes odour', 'Quick-connect inline design, easy to replace', 'Protects the RO membrane and pump', 'Genuine Olivar spare for RO purifiers'],
    tech: [['Type', 'Inline filter cartridge'], ['Fits', 'Olivar RO water purifiers'], ['Replacement', 'Every 6–12 months, depending on water quality']],
  },
  alkaline: {
    label: 'Alkaline Filter',
    about: [
      'The alkaline filter adds essential minerals back to RO water and raises its pH, giving a smoother, better-tasting drink.',
      'Fitted at the last stage of the purifier, it is simple to replace and keeps your water mineral-balanced.',
    ],
    features: ['Raises pH and restores minerals', 'Smoother taste', 'Fits at the final stage of the purifier', 'Genuine Olivar spare'],
    tech: [['Type', 'Alkaline / mineral-balancing filter'], ['Fits', 'Olivar RO water purifiers'], ['Replacement', 'Every 6–12 months']],
  },
  membrane: {
    label: 'Membrane Element',
    about: [
      'The RO membrane is the heart of the purifier: it removes dissolved salts, heavy metals and other impurities and reduces TDS.',
      'Replace it when taste changes, flow drops or TDS rises. Our technicians can fit it for you.',
    ],
    features: ['Removes dissolved salts and heavy metals', 'Reduces TDS', 'High rejection, long membrane life', 'Genuine Olivar spare'],
    tech: [['Type', 'RO membrane element, 80 GPD'], ['Fits', 'Olivar RO water purifiers'], ['Replacement', 'Every 12–24 months, depending on water quality']],
  },
  prefilter: {
    label: 'Pre Filter Housing',
    about: ['The pre-filter housing (bowl) holds the sediment/spun filter at the start of the purifier and stops sand, silt and rust from reaching the membrane.'],
    features: ['Strong, leak-proof body', 'Protects the membrane from sediment', 'Easy to open for cartridge change', 'Genuine Olivar spare'],
    tech: [['Type', 'Pre filter housing / bowl'], ['Fits', 'Olivar RO water purifiers']],
  },
  memhousing: {
    label: 'Membrane Housing',
    about: ['The membrane housing holds the RO membrane under pressure. A sturdy housing keeps the membrane sealed and the purifier leak-free.'],
    features: ['Pressure-rated, leak-proof', 'Easy membrane replacement', 'Durable material', 'Genuine Olivar spare'],
    tech: [['Type', 'Membrane housing'], ['Fits', 'Olivar RO water purifiers']],
  },
  float: {
    label: 'Float Valve',
    about: ['The float valve controls the water level in the storage tank and stops the flow when the tank is full, saving water and preventing overflow.'],
    features: ['Automatic shut-off when tank is full', 'Saves water', 'Simple replacement', 'Genuine Olivar spare'],
    tech: [['Type', 'Float valve'], ['Fits', 'Olivar RO water purifiers']],
  },
  smps: {
    label: 'SMPS',
    about: ['The SMPS (power supply) converts mains power to the safe low voltage that runs the purifier’s pump and solenoid valve.'],
    features: ['Stable output for pump and valve', 'Protected against overload', 'Energy efficient', 'Genuine Olivar spare'],
    tech: [['Type', 'SMPS power adapter'], ['Fits', 'Olivar RO water purifiers']],
  },
  booster: {
    label: 'Booster Pump',
    about: ['The booster pump raises water pressure so the RO membrane works efficiently, giving steady output even with low supply pressure.'],
    features: ['Consistent pressure for better purification', 'Quiet running', 'Long service life', 'Genuine Olivar spare'],
    tech: [['Type', 'RO booster pump'], ['Fits', 'Olivar RO water purifiers']],
  },
  teflon: {
    label: 'Teflon Tape',
    about: ['Teflon tape seals threaded plumbing joints and fittings of your purifier to prevent leaks.'],
    features: ['Leak-proof sealing', 'Easy to wrap and tear', 'Suitable for all threaded fittings'],
    tech: [['Type', 'PTFE thread seal tape']],
  },
  uvled: {
    label: 'UV LED',
    about: ['The UV LED lamp disinfects water by inactivating bacteria and viruses without chemicals or heat.'],
    features: ['Chemical-free disinfection', 'Low power consumption', 'Compact design', 'Genuine Olivar spare'],
    tech: [['Type', 'UV LED'], ['Fits', 'Olivar UV purifiers']],
  },
  solenoid: {
    label: 'Solenoid Valve',
    about: ['The solenoid valve opens and closes the inlet water automatically, switching the purifier on and off with the tank level.'],
    features: ['Automatic inlet control', 'Leak-free sealing', 'Reliable switching', 'Genuine Olivar spare'],
    tech: [['Type', 'Solenoid valve'], ['Fits', 'Olivar RO water purifiers']],
  },
  pp: {
    label: 'PP Spun Filter',
    about: ['The PP spun filter is the sediment stage: it traps sand, dust, silt and rust particles and protects the later stages and the membrane.'],
    features: ['Traps suspended particles', 'Protects the membrane', 'Easy to replace', 'Genuine Olivar spare'],
    tech: [['Type', 'PP spun sediment filter'], ['Fits', 'Olivar RO water purifiers'], ['Replacement', 'Every 3–6 months']],
  },
  kit: {
    label: 'Replaceable Filter Cartridge Kit',
    about: ['The complete replaceable filter cartridge kit lets you renew all the service filters of your purifier in one go.'],
    features: ['Complete service set', 'Convenient and cost-effective', 'Genuine Olivar spares'],
    tech: [['Type', 'Filter cartridge kit'], ['Fits', 'Olivar RO water purifiers']],
  },
  uvchamber: {
    label: 'UV Chamber',
    about: ['The UV chamber houses the UV lamp and exposes the water to UV light to destroy bacteria and viruses.'],
    features: ['Effective UV exposure', 'Sealed, leak-proof body', 'Easy lamp replacement', 'Genuine Olivar spare'],
    tech: [['Type', 'UV chamber'], ['Fits', 'Olivar RO + UV purifiers']],
  },
  mineral: {
    label: 'Mineral Cartridge',
    about: ['The mineral cartridge adds healthy minerals back into purified water and improves its taste.'],
    features: ['Restores essential minerals', 'Better taste', 'Easy to fit', 'Genuine Olivar spare'],
    tech: [['Type', 'Mineral cartridge'], ['Fits', 'Olivar RO water purifiers'], ['Replacement', 'Every 6–12 months']],
  },
  uf: {
    label: 'UF Membrane',
    about: ['The UF (ultrafiltration) membrane removes bacteria, cysts and suspended impurities without electricity, keeping the minerals in the water.'],
    features: ['Removes bacteria and cysts', 'Retains natural minerals', 'Long life', 'Genuine Olivar spare'],
    tech: [['Type', 'UF membrane'], ['Fits', 'Olivar UF / RO+UF purifiers']],
  },
}
