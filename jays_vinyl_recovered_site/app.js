(function () {
  "use strict";

  const appHeadEntries = [
    { tag: "meta", selector: 'meta[name="description"]', attributes: { name: "description", content: "Jay’s personal vinyl collection, wishlist and dream listening setup." } },
    { tag: "meta", selector: 'meta[name="apple-mobile-web-app-capable"]', attributes: { name: "apple-mobile-web-app-capable", content: "yes" } },
    { tag: "meta", selector: 'meta[name="apple-mobile-web-app-status-bar-style"]', attributes: { name: "apple-mobile-web-app-status-bar-style", content: "default" } },
    { tag: "meta", selector: 'meta[name="apple-mobile-web-app-title"]', attributes: { name: "apple-mobile-web-app-title", content: "Jay’s Vinyl" } },
    { tag: "meta", selector: 'meta[name="mobile-web-app-capable"]', attributes: { name: "mobile-web-app-capable", content: "yes" } },
    { tag: "link", selector: 'link[rel="manifest"]', attributes: { rel: "manifest", href: "manifest.webmanifest" } },
    { tag: "link", selector: 'link[rel="icon"]', attributes: { rel: "icon", href: "assets/vinyl-collection-icon.svg", type: "image/svg+xml" } },
    { tag: "link", selector: 'link[rel="apple-touch-icon"]', attributes: { rel: "apple-touch-icon", href: "assets/vinyl-collection-icon-180.png", sizes: "180x180" } }
  ];
  appHeadEntries.forEach(({ tag, selector, attributes }) => {
    const node = document.querySelector(selector) || document.createElement(tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
    if (!node.isConnected) document.head.appendChild(node);
  });
  document.querySelector('meta[name="viewport"]')?.setAttribute("content", "width=device-width,initial-scale=1,viewport-fit=cover");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#765236");

  const legacy = document.querySelector("main.wrap");
  if (!legacy) return;

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "studio.css?v=petal-shelf-layout-20261019b";
  document.head.appendChild(stylesheet);

  const clean = (value) => (value || "").replace(/\s+/g, " ").trim();
  const moneyValue = (value) => Number(clean(value).replace(/[^0-9.]/g, "")) || 0;
  const money = (value) => new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
  const escapeHTML = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  const escapeAttr = escapeHTML;
  const slug = (value) => clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  function backgroundURL(node) {
    if (!node) return "";
    const value = node.style.backgroundImage || "";
    const match = value.match(/^url\(["']?(.*?)["']?\)$/);
    return match ? match[1] : "";
  }

  const categoryNodes = Array.from(legacy.querySelectorAll("section.group"));
  const categories = categoryNodes.map((group, categoryIndex) => {
    const name = clean(group.querySelector("h2")?.textContent);
    const records = Array.from(group.querySelectorAll("details.record")).map((record, recordIndex) => {
      const title = clean(record.querySelector(".name")?.textContent);
      const edition = clean(record.querySelector(".edition")?.textContent);
      const priceText = clean(record.querySelector(".price")?.textContent);
      const visualImage = record.querySelector(".visual img[src]");
      const imageLink = record.querySelector("a.imglink[href]");
      const tile = record.querySelector(".tile");
      const sourceLink = record.querySelector("a.source[href]");
      const facts = Array.from(record.querySelectorAll(".fact")).map((fact) => ({
        label: clean(fact.querySelector("small")?.textContent),
        value: clean(fact.querySelector("b")?.textContent)
      })).filter((fact) => fact.label || fact.value);

      return {
        id: `${slug(name)}-${categoryIndex + 1}-${recordIndex + 1}`,
        title,
        edition,
        category: name,
        categoryIndex,
        recordIndex,
        priceText,
        price: moneyValue(priceText),
        description: clean(record.querySelector(".description")?.textContent),
        image: visualImage?.src || imageLink?.href || backgroundURL(tile),
        imageSource: imageLink?.href || "",
        referenceImage: imageLink?.href || backgroundURL(tile) || "",
        source: sourceLink?.href || "",
        facts
      };
    });

    return {
      name,
      index: categoryIndex,
      records,
      total: records.reduce((sum, record) => sum + record.price, 0)
    };
  });

  const tourCorrections = {
    "Ariana Grande — Eternal Sunshine": {
      title: "Ariana Grande — Yours Truly",
      edition: "Eternal Sunshine Tour exclusive · Pink & Cream",
      priceText: "£25.00",
      price: 25,
      image: "assets/tour-yours-truly-white-background-2026.jpeg",
      imageSource: "assets/tour-yours-truly-white-background-2026.jpeg",
      source: "https://www.recordsetplay.com/product-detail/ariana-grande-yours-truly-eternal-sunshine-tour-exclusive-pink-and-cream-vinyl-lp",
      description: "The 2026 Eternal Sunshine Tour pop-up edition of Yours Truly, pressed as a single LP on Pink & Cream vinyl.",
      facts: [
        { label: "Edition", value: "Eternal Sunshine Tour exclusive" },
        { label: "Record", value: "LP · Pink & Cream" },
        { label: "Paid", value: "£25.00" }
      ]
    },
    "Ariana Grande — My Everything": {
      edition: "Eternal Sunshine Tour exclusive · Baby Pink Black Wave",
      priceText: "£25.00",
      price: 25,
      image: "assets/tour-my-everything-white-background-2026.jpeg",
      imageSource: "assets/tour-my-everything-white-background-2026.jpeg",
      source: "https://www.recordsetplay.com/product-detail/ariana-grande-my-everything-eternal-sunshine-tour-exclusive-baby-pink-and-black-wave-vinyl-lp",
      description: "The 2026 Eternal Sunshine Tour exclusive single-LP pressing of My Everything on Baby Pink Black Wave vinyl.",
      facts: [
        { label: "Edition", value: "Eternal Sunshine Tour exclusive" },
        { label: "Record", value: "LP · Baby Pink Black Wave" },
        { label: "Paid", value: "£25.00" }
      ]
    },
    "Ariana Grande — Dangerous Woman": {
      edition: "Eternal Sunshine Tour exclusive · Milky Black Marble",
      image: "assets/tour-dangerous-woman-white-background-2026.jpeg",
      imageSource: "assets/tour-dangerous-woman-white-background-2026.jpeg",
      source: "https://www.recordsetplay.com/product-detail/ariana-grande-dangerous-woman-eternal-sunshine-tour-exclusive-milky-black-marble-vinyl-2lp",
      description: "The 2026 Eternal Sunshine Tour exclusive 2LP pressing of Dangerous Woman on Milky Black Marble vinyl.",
      facts: [
        { label: "Edition", value: "Eternal Sunshine Tour exclusive" },
        { label: "Record", value: "2LP · Milky Black Marble" },
        { label: "Paid", value: "£32.00" }
      ]
    },
    "Ariana Grande — Sweetener": {
      edition: "Eternal Sunshine Tour exclusive · Pink & Orange Burst",
      priceText: "£32.00",
      price: 32,
      image: "assets/tour-sweetener-white-background-2026.jpeg",
      imageSource: "assets/tour-sweetener-white-background-2026.jpeg",
      source: "https://www.recordsetplay.com/product-detail/ariana-grande-sweetener-eternal-sunshine-tour-exclusive-pink-and-orange-burst-vinyl-2lp",
      description: "The 2026 Eternal Sunshine Tour pop-up edition of Sweetener, pressed as a 2LP on Pink & Orange Burst vinyl.",
      facts: [
        { label: "Edition", value: "Eternal Sunshine Tour exclusive" },
        { label: "Record", value: "2LP · Pink & Orange Burst" },
        { label: "Paid", value: "£32.00" }
      ]
    },
    "Ariana Grande — thank u, next": {
      edition: "Eternal Sunshine Tour exclusive · Pink & Clear Marble",
      image: "assets/tour-thank-u-next-white-background-2026.jpeg",
      imageSource: "assets/tour-thank-u-next-white-background-2026.jpeg",
      source: "https://www.recordsetplay.com/product-detail/ariana-grande-thank-u-next-eternal-sunshine-tour-exclusive-pink-and-clear-marble-vinyl-2lp",
      description: "The 2026 Eternal Sunshine Tour pop-up edition of thank u, next, pressed as a 2LP on Pink & Clear Marble vinyl.",
      facts: [
        { label: "Edition", value: "Eternal Sunshine Tour exclusive" },
        { label: "Record", value: "2LP · Pink & Clear Marble" },
        { label: "Paid", value: "£32.00" }
      ]
    },
    "Ariana Grande — Positions": {
      edition: "Eternal Sunshine Tour exclusive · Pink & Mint Green Splatter",
      image: "assets/tour-positions-white-background-2026.jpeg",
      imageSource: "assets/tour-positions-white-background-2026.jpeg",
      source: "https://www.recordsetplay.com/product-detail/ariana-grande-positions-eternal-sunshine-tour-exclusive-pink-and-mint-green-splatter-vinyl-lp",
      description: "The 2026 Eternal Sunshine Tour pop-up edition of Positions, pressed as a single LP on Pink & Mint Green Splatter vinyl.",
      facts: [
        { label: "Edition", value: "Eternal Sunshine Tour exclusive" },
        { label: "Record", value: "LP · Pink & Mint Green Splatter" },
        { label: "Paid", value: "£25.00" }
      ]
    },
    "Ariana Grande — Brighter Days Ahead": {
      edition: "Eternal Sunshine Tour exclusive · Opaque Blue Marble · lenticular cover",
      image: "assets/tour-brighter-days-ahead-white-background-2026.jpeg",
      imageSource: "assets/tour-brighter-days-ahead-white-background-2026.jpeg",
      source: "https://www.recordsetplay.com/product-detail/ariana-grande-eternal-sunshine-deluxe-brighter-days-ahead-eternal-sunshine-tour-exclusive-lenticular",
      description: "The Eternal Sunshine Tour exclusive 2LP edition of Brighter Days Ahead on Opaque Blue Marble vinyl, finished with the lenticular cover.",
      facts: [
        { label: "Edition", value: "Eternal Sunshine Tour exclusive" },
        { label: "Record", value: "2LP · Opaque Blue Marble · lenticular cover" },
        { label: "Paid", value: "£35.00" }
      ]
    }
  };

  const tourCategory = categories.find((category) => category.name === "Tour-exclusive editions");
  tourCategory?.records.forEach((record) => {
    const correction = tourCorrections[record.title];
    if (correction) Object.assign(record, correction);
  });

  const wickedOneWonderfulNight = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Wicked: One Wonderful Night");
  if (wickedOneWonderfulNight) {
    Object.assign(wickedOneWonderfulNight, {
      edition: "RSD 2026 exclusive · 2LP · Fuchsia & Green Marble",
      image: "assets/wicked-one-wonderful-night-rsd26-accurate-v2.png",
      imageSource: "assets/wicked-one-wonderful-night-rsd26-accurate-v2.png",
      source: "https://www.recordstoreday.co.uk/release/ariana-grande-wicked-one-wonderful-night-live-the-soundtrack",
      description: "Record Store Day 2026 exclusive live soundtrack. The two physical records are a vivid fuchsia-pink marble and a translucent leafy-green marble, both carrying pale cloudy movement and small yellow-gold wisps. The clean product image is colour-matched to photographs of the actual pressing.",
      rare: true,
      facts: [
        { label: "Edition", value: "Record Store Day 2026 exclusive" },
        { label: "Record", value: "2LP · Fuchsia-pink marble + leafy-green marble" },
        { label: "Paid", value: wickedOneWonderfulNight.priceText }
      ]
    });
  }

  const dangerousWomanAnniversary = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Ariana Grande — Dangerous Woman" && record.edition.includes("10th Anniversary"));
  if (dangerousWomanAnniversary) {
    Object.assign(dangerousWomanAnniversary, {
      priceText: "£44.94",
      price: 44.94,
      limitedEdition: true,
      outOfStock: true,
      image: "assets/dangerous-woman-10th-exact-v2.webp",
      imageSource: "assets/dangerous-woman-10th-exact-v2.webp",
      source: "https://shopuk.arianagrande.com/products/dangerous-woman-tenth-anniversary-edition-2lp-2026-art",
      description: "Official-store 10th-anniversary 2LP edition with reimagined 2026 artwork, pressed on pink-and-black-in-clear vinyl. This replaces the cancelled and refunded Vinted order.",
      facts: [
        { label: "Edition", value: "Official-store 10th Anniversary Edition" },
        { label: "Record", value: "2LP · pink and black in clear" },
        { label: "Status", value: "Limited edition · currently out of stock" },
        { label: "Paid", value: "£44.94" }
      ]
    });
  }

  const positionsDeluxe = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Ariana Grande — Positions Deluxe" && record.edition.includes("Purple in clear"));
  if (positionsDeluxe) {
    Object.assign(positionsDeluxe, {
      priceText: "£212.99",
      price: 212.99,
      extremelyRare: true,
      facts: [
        { label: "Edition", value: "First-anniversary deluxe · 2LP" },
        { label: "Record", value: "Purple in clear · gatefold" },
        { label: "Paid", value: "£212.99" }
      ]
    });
  }

  const standardPositions = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Ariana Grande — Positions" && record.edition.includes("Standard Positions LP"));
  if (standardPositions) {
    standardPositions.edition = "Coke Bottle Clear LP · official store";
    standardPositions.suppressVariant = true;
    standardPositions.facts = [
      { label: "Edition", value: "Coke Bottle Clear LP · official store" },
      { label: "Record", value: "LP · Coke Bottle Clear" },
      { label: "Paid", value: standardPositions.priceText }
    ];
  }

  const standardSweetener = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Ariana Grande — Sweetener" && record.edition === "Standard vinyl");
  if (standardSweetener) {
    standardSweetener.edition = "Standard black-vinyl 2LP";
    standardSweetener.facts = [
      { label: "Edition", value: "Standard black-vinyl edition" },
      { label: "Record", value: "2LP · black vinyl" },
      { label: "Paid", value: standardSweetener.priceText }
    ];
  }

  const brighterDaysRetail = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Ariana Grande — Brighter Days Ahead" && record.edition.includes("HMV translucent"));
  if (brighterDaysRetail) {
    brighterDaysRetail.edition = "Translucent Marble 2LP · purchased at HMV";
    brighterDaysRetail.facts = [
      { label: "Edition", value: "Deluxe retail pressing · purchased at HMV" },
      { label: "Record", value: "2LP · translucent marble" },
      { label: "Paid", value: brighterDaysRetail.priceText }
    ];
  }

  const sabrinaBadWorld = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Sabrina Carpenter — Man’s Best Friend" && record.edition.includes("Bad World"));
  if (sabrinaBadWorld) {
    sabrinaBadWorld.source = "https://bad-world.co.uk/products/mbf";
    sabrinaBadWorld.image = "assets/sabrina-mans-best-friend-pink-champagne.webp";
    sabrinaBadWorld.imageSource = "assets/sabrina-mans-best-friend-pink-champagne.webp";
    sabrinaBadWorld.rare = true;
  }

  const oliviaSunsetOrange = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Olivia Dean — The Art of Loving" && record.edition.includes("Sunset Orange"));
  if (oliviaSunsetOrange) oliviaSunsetOrange.rare = true;

  const christmasAndChillAnniversary = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Ariana Grande — Christmas & Chill" && record.edition.includes("10th Anniversary"));
  if (christmasAndChillAnniversary) christmasAndChillAnniversary.rare = true;

  const alexNostalgia = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Alex Warren — WILDCHILD" && record.edition.includes("Limited Nostalgia Edition"));
  if (alexNostalgia) {
    Object.assign(alexNostalgia, {
      edition: "Limited Nostalgia Edition · glow-in-the-dark vinyl",
      image: "assets/alex-warren-wildchild-nostalgia-unsigned.png",
      imageSource: "assets/alex-warren-wildchild-nostalgia-unsigned.png",
      source: "https://austore.alexwarrenofficial.com/collections/wildchild",
      description: "Limited Nostalgia Edition on glow-in-the-dark vinyl, presented in alternate packaging built around Alex Warren’s childhood photographs. This copy does not include a signed card.",
      facts: [
        { label: "Edition", value: "Limited Nostalgia Edition" },
        { label: "Record", value: "LP · glow-in-the-dark · unsigned copy" },
        { label: "Paid", value: alexNostalgia.priceText }
      ]
    });
  }

  const wickedForGoodCustom = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Wicked: For Good — The Soundtrack" && record.edition.includes("Yellow Brick Road"));
  if (wickedForGoodCustom) {
    Object.assign(wickedForGoodCustom, {
      edition: "Custom configuration · standard gatefold + Yellow Brick Road picture discs",
      image: "assets/wicked-for-good-custom-configuration.png",
      imageSource: "assets/wicked-for-good-custom-configuration.png",
      description: "Owner-assembled custom configuration pairing the standard gatefold jacket and printed inner sleeves with the Yellow Brick Road picture-disc 2LP set issued for Record Store Day Black Friday 2025. This sleeve-and-disc combination was not sold as a factory retail edition.",
      facts: [
        { label: "Edition", value: "Owner-assembled custom configuration" },
        { label: "Record", value: "2LP · Yellow Brick Road picture discs · standard gatefold" },
        { label: "Paid", value: wickedForGoodCustom.priceText }
      ]
    });
  }

  const wickedSoundtrackCustom = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Wicked: The Soundtrack");
  if (wickedSoundtrackCustom) {
    Object.assign(wickedSoundtrackCustom, {
      edition: "Collector’s Case discs · standard gatefold",
      image: "assets/wicked-soundtrack-custom-configuration.png",
      imageSource: "assets/wicked-soundtrack-custom-configuration.png",
      description: "Custom configuration pairing the standard Wicked gatefold and printed inner sleeves with the genuine Collector’s Case soundtrack discs: Glinda pink splatter/marbled vinyl and Elphaba green marbled vinyl. The records are the special Collector’s Case variants; only the outer gatefold differs from the complete retail set.",
      facts: [
        { label: "Edition", value: "Collector’s Case discs · custom sleeve configuration" },
        { label: "Record", value: "2LP · Glinda pink splatter/marbled + Elphaba green marbled" },
        { label: "Paid", value: wickedSoundtrackCustom.priceText }
      ]
    });
  }

  const catalogueDescriptions = [
    {
      title: "Skye Newman — SE9 Part 1 & 2",
      editionIncludes: "signed art card",
      description: "D2C-exclusive black-vinyl edition compiling SE9 Part 1 and Part 2, supplied with a signed art card. The vinyl sequence includes the exclusive track “Blood” and the acoustic version of “Too Far South”."
    },
    {
      title: "Wicked: For Good — The Soundtrack",
      editionIncludes: "Custom configuration",
      description: "Owner-assembled custom configuration pairing the standard gatefold jacket and printed inner sleeves with the Yellow Brick Road picture-disc 2LP set issued for Record Store Day Black Friday 2025. This sleeve-and-disc combination was not sold as a factory retail edition."
    },
    {
      title: "Wicked: The Soundtrack",
      editionIncludes: "Collector’s Case discs",
      description: "Custom configuration pairing the standard Wicked gatefold and printed inner sleeves with the genuine Collector’s Case soundtrack discs: Glinda pink splatter/marbled vinyl and Elphaba green marbled vinyl. The records are the special Collector’s Case variants; only the outer gatefold differs from the complete retail set."
    },
    {
      title: "Wicked: The Score",
      editionIncludes: "original motion picture score",
      description: "The original motion picture score for Wicked: Part One, pressed across two standard black LPs in a non-gatefold sleeve. Issued without printed inner sleeves or additional inserts."
    },
    {
      title: "Ariana Grande — Positions",
      editionIncludes: "Coke Bottle Clear LP",
      description: "Standard single-LP pressing of Positions on Coke Bottle Clear vinyl, purchased from Ariana Grande’s official store."
    },
    {
      title: "Sienna Spiro — The Visitor",
      editionIncludes: "Tangerine vinyl",
      description: "Tangerine-coloured LP edition of The Visitor, supplied with a signed insert."
    },
    {
      title: "Wicked: One Wonderful Night",
      editionIncludes: "RSD 2026 exclusive",
      description: "Record Store Day 2026 exclusive live soundtrack on a 2LP Purple & Green Splatter pressing; the physical discs present as vivid fuchsia-pink marble and translucent leafy green marble with yellow-gold wisps."
    },
    {
      title: "Alex Warren — WILDCHILD",
      editionIncludes: "Limited Nostalgia Edition",
      description: "Limited Nostalgia Edition on glow-in-the-dark vinyl, presented in alternate packaging built around Alex Warren’s childhood photographs. This copy does not include a signed card."
    },
    {
      title: "Ariana Grande — Petal",
      editionIncludes: "Cloudy Gray Girl",
      description: "Official-store exclusive Cloudy Gray Girl LP in a gatefold jacket, with a printed die-cut inner sleeve and a 16-page 12 × 12 in booklet featuring lyrics and photography."
    },
    {
      title: "Ariana Grande — Petal",
      editionIncludes: "Opal Girly",
      description: "Official-store exclusive Opal Girly LP with a lenticular cover and unique gatefold artwork, plus a printed die-cut inner sleeve and deluxe 28-page booklet featuring lyrics and photography."
    },
    {
      title: "Ariana Grande — Sweetener",
      editionIncludes: "Standard black-vinyl 2LP",
      description: "Standard black-vinyl 2LP edition of Sweetener, purchased from Stylus Records in Lichfield."
    },
    {
      title: "Ariana Grande — Dangerous Woman",
      editionIncludes: "10th Anniversary",
      description: "10th-anniversary 2LP edition using the reimagined 2026 cover artwork, pressed on pink-and-black-in-clear vinyl."
    },
    {
      title: "Ariana Grande — Brighter Days Ahead",
      editionIncludes: "purchased at HMV",
      description: "Standard deluxe 2LP edition on translucent marbled vinyl, housed in a gatefold jacket with a 24-page booklet featuring lyrics and new photography. Purchased from HMV."
    },
    {
      title: "Olivia Dean — The Art of Loving",
      editionIncludes: "Sunset Orange",
      description: "Limited Sunset Orange LP edition of The Art of Loving, paired with the alternative cover artwork."
    },
    {
      title: "Ariana Grande — Christmas & Chill",
      editionIncludes: "10th Anniversary",
      description: "10th-anniversary edition pressed on clear vinyl with a snowflake etching and packaged with a cinnamon-scented inner sleeve."
    },
    {
      title: "Ariana Grande — Positions Deluxe",
      editionIncludes: "Purple in clear",
      description: "First-anniversary deluxe 2LP edition on Purple-in-Clear vinyl, housed in a gatefold jacket and embossed black cut-out slipcase. Includes custom inner sleeves, a sticker sheet, a large fold-out poster and the five deluxe tracks."
    },
    {
      title: "Ariana Grande — Yours Truly",
      editionIncludes: "Pink & Cream",
      description: "Eternal Sunshine Tour exclusive single-LP edition of Yours Truly, pressed on Pink & Cream vinyl."
    },
    {
      title: "Ariana Grande — Positions",
      editionIncludes: "Pink & Mint Green Splatter",
      description: "Eternal Sunshine Tour exclusive single-LP edition of Positions, pressed on Pink & Mint Green Splatter vinyl."
    },
    {
      title: "Ariana Grande — Sweetener",
      editionIncludes: "Pink & Orange Burst",
      description: "Eternal Sunshine Tour exclusive 2LP edition of Sweetener, pressed on Pink & Orange Burst vinyl."
    },
    {
      title: "Ariana Grande — Dangerous Woman",
      editionIncludes: "Milky Black Marble",
      description: "Eternal Sunshine Tour exclusive 2LP edition of Dangerous Woman, pressed on Milky Black Marble vinyl."
    },
    {
      title: "Ariana Grande — My Everything",
      editionIncludes: "Baby Pink Black Wave",
      description: "Eternal Sunshine Tour exclusive single-LP edition of My Everything, pressed on Baby Pink Black Wave vinyl."
    },
    {
      title: "Ariana Grande — thank u, next",
      editionIncludes: "Pink & Clear Marble",
      description: "Eternal Sunshine Tour exclusive 2LP edition of thank u, next, pressed on Pink & Clear Marble vinyl."
    },
    {
      title: "Ariana Grande — Brighter Days Ahead",
      editionIncludes: "Opaque Blue Marble",
      description: "Eternal Sunshine Tour exclusive 2LP edition of Brighter Days Ahead, pressed on Opaque Blue Marble vinyl and presented with a lenticular cover."
    },
    {
      title: "Ariana Grande — Petal",
      editionIncludes: "Bad World flower-filled",
      description: "Bad World dry-filled LP containing real white daisy, delphinium and gypsophila flowers, supplied with a 16-page pull-out booklet."
    },
    {
      title: "Sabrina Carpenter — Man’s Best Friend",
      editionIncludes: "Pink Champagne liquid-filled",
      description: "Bad World carbonated Pink Champagne liquid-filled LP, limited to 5,000 copies and presented with an alternate sleeve and exclusive cork-style centre labels."
    }
  ];

  catalogueDescriptions.forEach(({ title, editionIncludes, description }) => {
    const record = categories
      .flatMap((category) => category.records)
      .find((item) => item.title === title && item.edition.includes(editionIncludes));
    if (record) record.description = description;
  });

  const opalGirlyPetal = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Ariana Grande — Petal" && record.edition.includes("Opal Girly"));
  if (opalGirlyPetal) {
    Object.assign(opalGirlyPetal, {
      variant: true,
      limitedEdition: true,
      outOfStock: true
    });
    opalGirlyPetal.facts = [
      ...opalGirlyPetal.facts.filter((fact) => fact.label !== "Status"),
      { label: "Status", value: "Limited lenticular-cover variant · currently out of stock" }
    ];
  }

  const badWorldPetal = categories
    .flatMap((category) => category.records)
    .find((record) => record.title === "Ariana Grande — Petal" && record.edition.includes("Bad World flower-filled"));
  if (badWorldPetal) {
    Object.assign(badWorldPetal, {
      rare: true,
      variant: true,
      limitedEdition: true
    });
  }

  const emailPurchasesCategory = categories.find((category) => category.name === "Other purchases") || categories[0];
  const confirmedEmailPurchases = [
    {
      id: "email-purchase-petal-dandelion-white",
      title: "Ariana Grande — Petal",
      edition: "Dandelion White 7-inch · official store",
      priceText: "£15.46",
      price: 15.46,
      description: "Official-store 7-inch edition of Petal, pressed on Dandelion White vinyl. The paid order total, including delivery, has been divided across the two Petal 7-inch colour variants in the same order.",
      image: "assets/petal_white_sleeve.png",
      imageSource: "assets/petal_white_sleeve.png",
      sleeveImage: "assets/petal_white_sleeve.png",
      discImage: "assets/petal_white_disc.png",
      source: "https://shopuk.arianagrande.com/products/petal-dandelion-white-7",
      facts: [
        { label: "Edition", value: "Official-store 7-inch single" },
        { label: "Record", value: "7-inch · Dandelion White" },
        { label: "Paid", value: "£15.46" }
      ]
    },
    {
      id: "email-purchase-petal-pepper-yellow",
      title: "Ariana Grande — Petal",
      edition: "Pepper Yellow 7-inch · official store",
      priceText: "£15.47",
      price: 15.47,
      description: "Official-store 7-inch edition of Petal, pressed on Pepper Yellow vinyl. The paid order total, including delivery, has been divided across the two Petal 7-inch colour variants in the same order.",
      image: "assets/petal_yellow_sleeve.png",
      imageSource: "assets/petal_yellow_sleeve.png",
      sleeveImage: "assets/petal_yellow_sleeve.png",
      discImage: "assets/petal_yellow_disc.png",
      source: "https://shopuk.arianagrande.com/products/petal-pepper-yellow-7",
      facts: [
        { label: "Edition", value: "Official-store 7-inch single" },
        { label: "Record", value: "7-inch · Pepper Yellow" },
        { label: "Paid", value: "£15.47" }
      ]
    },
    {
      id: "email-purchase-sienna-spiro-visitor-red-alt",
      title: "Sienna Spiro — The Visitor",
      edition: "Red vinyl · alternate artwork · Indies Exclusive",
      priceText: "£27.99",
      price: 27.99,
      description: "Indies-exclusive red-vinyl pressing of The Visitor with alternate sleeve artwork, ordered from Banquet Records. The order included the requested dedication: “To Jay, Love sienna x”.",
      image: "assets/sienna-spiro-visitor-red-alt.webp",
      imageSource: "assets/sienna-spiro-visitor-red-alt.webp",
      source: "https://www.banquetrecords.com/",
      facts: [
        { label: "Edition", value: "Indies Exclusive · alternate artwork" },
        { label: "Record", value: "LP · red vinyl" },
        { label: "Paid", value: "£27.99" }
      ]
    },
    {
      id: "email-purchase-jamie-miller-baby-doll-blue",
      title: "Jamie Miller — Baby Doll",
      edition: "Blue 7-inch · signed art card",
      priceText: "£17.94",
      price: 17.94,
      description: "Island Records exclusive 7-inch single pressed on blue vinyl, ordered with a signed Jamie Miller art card. The recorded price includes both items and delivery.",
      image: "assets/jamie-miller-baby-doll-blue.png",
      imageSource: "assets/jamie-miller-baby-doll-blue.png",
      source: "https://shop.islandrecords.co.uk/collections/jamie-miller",
      facts: [
        { label: "Edition", value: "Island Records exclusive · signed art card" },
        { label: "Record", value: "7-inch · blue vinyl" },
        { label: "Paid", value: "£17.94" }
      ]
    },
    {
      id: "email-purchase-olivia-dean-live-at-bbc-rsd26",
      title: "Olivia Dean — Live at the BBC",
      edition: "RSD 2026 exclusive · Black 7-inch",
      priceText: "£13.00",
      price: 13,
      rare: true,
      limitedEdition: true,
      description: "Record Store Day 2026 exclusive black 7-inch, bought from Banquet Records. The total paid is recorded as £13.00: £12.00 for the record plus £1.00 UK standard postage.",
      image: "https://media.recordstoreday.co.uk/storage/v1/object/public/release-images/card/85edac63-6167-4bbc-a36c-c7e95a128d10.webp",
      imageSource: "https://media.recordstoreday.co.uk/storage/v1/object/public/release-images/card/85edac63-6167-4bbc-a36c-c7e95a128d10.webp",
      source: "https://www.banquetrecords.com/olivia-dean/live-at-the-bbc-%5Brsd26%5D/8833826",
      facts: [
        { label: "Edition", value: "Record Store Day 2026 exclusive" },
        { label: "Record", value: "Limited black 7-inch" },
        { label: "Tracks", value: "You've Got A Friend / Cool About It (live for BBC)" },
        { label: "Paid", value: "£13.00 including £1.00 postage" }
      ]
    }
  ].map((record, index) => ({
    ...record,
    category: emailPurchasesCategory.name,
    categoryIndex: emailPurchasesCategory.index,
    recordIndex: emailPurchasesCategory.records.length + index
  }));
  emailPurchasesCategory.records.push(...confirmedEmailPurchases);

  const allRecords = categories.flatMap((category) => category.records);
  function artistForRecord(record) {
    if (record.title.startsWith("Wicked")) return "Wicked";
    const separator = record.title.indexOf(" — ");
    return separator === -1 ? "Other" : record.title.slice(0, separator);
  }

  function displayTitle(record) {
    const prefix = `${record.artist} — `;
    return record.title.startsWith(prefix) ? record.title.slice(prefix.length) : record.title;
  }

  function displayPriceText(record, value = record.priceText) {
    if (!record.wishlist || !record.market) return value;
    const availability = record.market.availability || "Release watch";
    const price = record.market.itemPrice == null ? "" : money(record.market.itemPrice);
    if (/sold out/i.test(availability)) return price ? `Sold out · last ${price}` : /last\s+(?:US\s*)?[$£€]/i.test(value) ? value : "Sold out";
    if (/pre-order/i.test(availability)) return price ? `${price} · pre-order` : "Pre-order open";
    if (/resale available/i.test(availability)) return price ? `${price} · resale` : "Resale available";
    if (/in stock/i.test(availability)) return price ? `${price} · in stock` : "In stock";
    return price ? `${price} · watching` : availability;
  }

  allRecords.forEach((record) => {
    record.artist = artistForRecord(record);
  });

  function upsertRecordFact(record, label, value) {
    const existing = record.facts.find((fact) => fact.label.toLowerCase() === label.toLowerCase());
    if (existing) existing.value = value;
    else record.facts.push({ label, value });
  }

  // Jay's copy-specific facts sit above generic catalogue copy. These are kept
  // deliberately separate so edition research can never overwrite provenance.
  allRecords.forEach((record) => {
    upsertRecordFact(record, "Condition", "Excellent · carefully stored");
    upsertRecordFact(record, "Play history", "Played sparingly");
  });

  const skyeSe9 = allRecords.find((record) => record.title === "Skye Newman — SE9 Part 1 & 2");
  if (skyeSe9) {
    skyeSe9.edition = "D2C vinyl · signed insert";
    skyeSe9.description = "Direct-to-consumer black-vinyl edition compiling SE9 Part 1 and Part 2, with the signed insert kept inside Jay’s copy. The vinyl sequence includes the exclusive track “Blood” and the acoustic version of “Too Far South”.";
    skyeSe9.facts = skyeSe9.facts.map((fact) => /signed art card/i.test(fact.value) ? { ...fact, value: fact.value.replace(/signed art card/ig, "signed insert") } : fact);
  }

  const redVisitor = allRecords.find((record) => record.title === "Sienna Spiro — The Visitor" && record.edition.includes("Red vinyl"));
  if (redVisitor) {
    redVisitor.description = "Indies-exclusive red-vinyl pressing of The Visitor with alternate sleeve artwork, ordered from Banquet Records. This is the unsigned edition; the signed insert belongs to Jay’s Tangerine copy.";
    redVisitor.facts = redVisitor.facts.filter((fact) => !/signed|dedicat/i.test(`${fact.label} ${fact.value}`));
    upsertRecordFact(redVisitor, "Edition detail", "Unsigned Indies edition");
  }

  const hmvBrighterDays = allRecords.find((record) => record.title === "Ariana Grande — Brighter Days Ahead" && record.edition.includes("purchased at HMV"));
  if (hmvBrighterDays) upsertRecordFact(hmvBrighterDays, "Condition", "Vinyl good · small seam rip and light wear to the gatefold");

  const christmasAndChillCopy = allRecords.find((record) => record.title === "Ariana Grande — Christmas & Chill" && record.edition.includes("10th Anniversary"));
  if (christmasAndChillCopy) {
    christmasAndChillCopy.source = "https://aftertone-records.com/products/ariana-grande-christmas-chill-10th-anniversary-edition-lp-clear-w-snowflake-etching";
    christmasAndChillCopy.description = "10th-anniversary clear-vinyl edition with snowflake etching and a cinnamon-scented inner sleeve, sourced from Aftertone Records in Mexico after the shop personally enabled international shipping for Jay.";
    upsertRecordFact(christmasAndChillCopy, "Retailer", "Aftertone Records · Mexico");
  }

  const wickedScoreCopy = allRecords.find((record) => record.title === "Wicked: The Score");
  if (wickedScoreCopy) upsertRecordFact(wickedScoreCopy, "Purchase", "Part of the three-record US eBay Wicked bundle");

  const positionsDeluxeCopy = allRecords.find((record) => record.title === "Ariana Grande — Positions Deluxe" && record.edition.includes("Purple in clear"));
  if (positionsDeluxeCopy) upsertRecordFact(positionsDeluxeCopy, "Retailer", "Vinted · £212.99 delivered");

  const oliviaSunsetCopy = allRecords.find((record) => record.title === "Olivia Dean — The Art of Loving" && record.edition.includes("Sunset Orange"));
  if (oliviaSunsetCopy) {
    oliviaSunsetCopy.description = "Limited Sunset Orange LP with the alternative cover, printed inner sleeve and lyric booklet. Jay deliberately chose the rarer orange pressing over the standard silver or black editions and imported it from a Netherlands record shop after finding a deal worth chasing.";
    oliviaSunsetCopy.catalogueNumber = "602478163388 · EAN 0602478163388";
    upsertRecordFact(oliviaSunsetCopy, "Retailer", "Specialist record shop · Netherlands");
  }

  const sabrinaPinkChampagne = allRecords.find((record) => record.title === "Sabrina Carpenter — Man’s Best Friend" && record.edition.includes("Pink Champagne"));
  if (sabrinaPinkChampagne) {
    sabrinaPinkChampagne.description = "Bad World carbonated Pink Champagne liquid-filled LP, limited to 5,000 copies worldwide, with exclusive cork-style centre labels and an alternate sleeve. Jay bought this copy on Vinted after a proper back-and-forth on price; it remains the collection’s first and only liquid-filled record.";
    upsertRecordFact(sabrinaPinkChampagne, "Retailer", "Vinted · negotiated resale purchase");
    upsertRecordFact(sabrinaPinkChampagne, "Limitation", "5,000 copies worldwide");
  }

  const previewLibrary = {
    familyMatters: { title: "Family Matters", artist: "Skye Newman", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3c/d9/c3/3cd9c321-2b84-f35a-fc17-ed6ce69b54ad/mzaf_2412649236521851550.plus.aac.p.m4a" },
    forGood: { title: "For Good", artist: "Cynthia Erivo & Ariana Grande", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ce/9b/c9/ce9bc915-c3da-0b47-2242-67de6b26e215/mzaf_9130994580900501344.plus.aac.p.m4a" },
    defyingGravity: { title: "Defying Gravity", artist: "Cynthia Erivo feat. Ariana Grande", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f8/84/67/f884674a-ef37-030e-485e-496583bd69a1/mzaf_6328903455766987633.plus.aac.p.m4a" },
    defyingGravityLive: { title: "Defying Gravity · live", artist: "Cynthia Erivo", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/4c/4d/04/4c4d0452-84dc-423e-60fc-420d4fe4978d/mzaf_9226869732447896896.plus.aac.p.m4a" },
    arrivalAtShiz: { title: "Arrival at Shiz University", artist: "John Powell & Stephen Schwartz", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/90/83/4b/90834b55-bd45-e837-a4ec-a8bafaf77565/mzaf_4237588944465223184.plus.aac.p.m4a" },
    positions: { title: "positions", artist: "Ariana Grande", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/2e/42/3a/2e423aa9-ca58-fabd-0c6f-dd7ae46f70d3/mzaf_15267168538994108138.plus.aac.p.m4a" },
    maybe: { title: "MAYBE.", artist: "Sienna Spiro", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/cf/10/3c/cf103cc7-a954-6efc-0340-b16bfece1186/mzaf_5273616044899205901.plus.aac.p.m4a" },
    passenger: { title: "PASSENGER", artist: "Alex Warren", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/41/6b/aa/416baaf6-4543-066a-c85a-f6962e3f5f40/mzaf_13993125136814345728.plus.aac.p.m4a" },
    petal: { title: "petal", artist: "Ariana Grande", url: "assets/petal_explicit_30s.mp3" },
    noTears: { title: "no tears left to cry", artist: "Ariana Grande", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f5/08/c7/f508c718-1958-46de-1092-5ff9dab86bdf/mzaf_2451337165221190709.plus.aac.p.m4a" },
    intoYou: { title: "Into You", artist: "Ariana Grande", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/19/f9/b4/19f9b4d7-3d53-13c8-ad81-5403e37ccc27/mzaf_4997590237151828626.plus.aac.p.m4a" },
    weCantBeFriends: { title: "we can’t be friends (wait for your love)", artist: "Ariana Grande", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/50/40/98/504098b5-c008-d726-334d-e90b94574d71/mzaf_15598331648080030139.plus.aac.p.m4a" },
    manINeed: { title: "Man I Need", artist: "Olivia Dean", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/42/bb/5b/42bb5b21-2550-6205-bf3c-334b0e7d6199/mzaf_17462928687872215879.plus.aac.p.m4a" },
    december: { title: "December", artist: "Ariana Grande", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f3/97/08/f3970872-cf42-938b-2aa8-948cd4c85d03/mzaf_11816072747581611325.plus.aac.p.m4a" },
    testDrive: { title: "test drive", artist: "Ariana Grande", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/5b/a7/ba/5ba7ba3a-fd6e-c6ec-7f94-562d6ee73dcc/mzaf_5848696659999662118.plus.aac.p.m4a" },
    honeymoonAvenue: { title: "Honeymoon Avenue", artist: "Ariana Grande", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b3/9d/56/b39d5626-096b-3e3b-5e65-29c6b2d47b59/mzaf_169744664921766603.plus.aac.p.m4a" },
    oneLastTime: { title: "One Last Time", artist: "Ariana Grande", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0a/31/68/0a3168a6-e2a5-8df5-3fee-b628a2a0d5e3/mzaf_3846916874957063928.plus.aac.p.m4a" },
    sevenRings: { title: "7 rings", artist: "Ariana Grande", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d5/c8/f3/d5c8f31b-1c8f-93ed-e78b-8c0bce3e8b66/mzaf_14456154925680073521.plus.aac.p.m4a" },
    dandelion: { title: "dandelion", artist: "Ariana Grande", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d8/b1/02/d8b102d2-a9d3-722d-bf25-a39d2e9d35b2/mzaf_8408514929563451288.plus.aac.p.m4a" },
    tears: { title: "Tears", artist: "Sabrina Carpenter", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8e/39/c2/8e39c256-a452-8928-5f45-9a82d6873f5e/mzaf_11132789052180673913.plus.aac.p.m4a" },
    babyDoll: { title: "Babydoll", artist: "Jamie Miller", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4c/0f/a6/4c0fa6ea-c3d4-cfe3-8ceb-11dfffb2f53b/mzaf_131464960054833274.plus.aac.p.m4a" }
  };

  function previewForRecord(record) {
    const edition = `${record.title} ${record.edition}`.toLowerCase();
    if (record.title.startsWith("Skye Newman")) return previewLibrary.familyMatters;
    if (record.title === "Wicked: For Good — The Soundtrack") return previewLibrary.forGood;
    if (record.title === "Wicked: The Soundtrack") return previewLibrary.defyingGravity;
    if (record.title === "Wicked: The Score") return previewLibrary.arrivalAtShiz;
    if (record.title === "Wicked: One Wonderful Night") return previewLibrary.defyingGravityLive;
    if (record.title.startsWith("Sienna Spiro")) return previewLibrary.maybe;
    if (record.title.startsWith("Alex Warren")) return previewLibrary.passenger;
    if (record.title.startsWith("Olivia Dean")) return previewLibrary.manINeed;
    if (record.title.startsWith("Jamie Miller")) return previewLibrary.babyDoll;
    if (record.title.startsWith("Sabrina Carpenter")) return previewLibrary.tears;
    if (/christmas & chill/.test(edition)) return previewLibrary.december;
    if (/positions deluxe/.test(edition)) return previewLibrary.testDrive;
    if (/positions/.test(edition)) return previewLibrary.positions;
    if (/yours truly/.test(edition)) return previewLibrary.honeymoonAvenue;
    if (/my everything/.test(edition)) return previewLibrary.oneLastTime;
    if (/dangerous woman/.test(edition)) return previewLibrary.intoYou;
    if (/sweetener/.test(edition)) return previewLibrary.noTears;
    if (/thank u, next/.test(edition)) return previewLibrary.sevenRings;
    if (/brighter days ahead|eternal sunshine/.test(edition)) return previewLibrary.weCantBeFriends;
    if (/petal/.test(edition)) return previewLibrary.petal;
    return previewLibrary.weCantBeFriends;
  }

  allRecords.forEach((record) => { record.nowPlaying = previewForRecord(record); });

  const collectionJournal = [
    {
      match: (record) => record.title === "Skye Newman — SE9 Part 1 & 2",
      date: "2026 · date not recorded",
      place: "Skye Newman official store",
      note: "A friend introduced Jay to “Family Matters”, and Skye quickly became a favourite. After going to her exclusive event, he ordered her only vinyl online that same day. It became the second vinyl he bought, with the signed insert kept safely inside."
    },
    {
      match: (record) => record.title === "Wicked: The Score",
      date: "2026 · date not recorded",
      place: "eBay · shipped from the United States",
      note: "The black-vinyl original motion picture score arrived as the third record in the same US eBay bundle as the two Wicked soundtrack LPs. It is part of one connected find, not a separate shop purchase."
    },
    {
      match: (record) => record.title === "Ariana Grande — Positions" && record.edition.includes("Coke Bottle Clear"),
      date: "2026 · first record physically owned",
      place: "Ariana Grande official store",
      note: "Jay’s first-ever vinyl. He debated paying more for the deluxe, chose the Coke Bottle Clear standard copy instead, and only later realised how difficult the deluxe would become to find. Positions won the first-album decision because it may still be his favourite Ariana album."
    },
    {
      match: (record) => record.title === "Sienna Spiro — The Visitor" && record.edition.includes("Tangerine"),
      date: "30 June 2026",
      place: "Sienna Spiro official store",
      note: "A friend played Jay “Maybe” the year before and he had loved Sienna’s music ever since. He bought the Tangerine edition on 30 June; this is the copy with the signed insert."
    },
    {
      match: (record) => record.title === "Alex Warren — WILDCHILD",
      date: "2026 · date not recorded",
      place: "Alex Warren official store",
      note: "Chosen for the Nostalgia alternate cover, the personal childhood photographs on the back and the more limited glow-in-the-dark pressing. Jay’s copy is unsigned."
    },
    {
      match: (record) => record.title === "Ariana Grande — Petal" && record.edition.includes("Cloudy Gray Girl"),
      date: "28 April 2026",
      place: "Ariana Grande official store · pre-order",
      note: "Ordered the day the album was announced. Technically this was the first vinyl Jay ordered, but it was a pre-order for the 31 July release; Positions arrived first and therefore became the first record physically in the collection."
    },
    {
      match: (record) => record.title === "Ariana Grande — Petal" && record.edition.includes("Opal Girly"),
      date: "2026 · date not recorded",
      place: "Ariana Grande official store",
      note: "Jay was not planning to variant-collect this album, but the Opal disc and lenticular cover were too beautiful to ignore. Every restock seemed to disappear in seconds, which turned finally securing it into part of the story."
    },
    {
      match: (record) => record.title === "Olivia Dean — The Art of Loving" && record.edition.includes("Sunset Orange"),
      date: "2026 · date not recorded",
      place: "Netherlands record shop · imported to the UK",
      note: "Jay did not want the standard silver or black pressing. He held out for the rarer Sunset Orange alternate-cover edition, then found the kind of overseas deal that makes collecting genuinely exciting and brought it home from the Netherlands."
    },
    {
      match: (record) => record.title === "Ariana Grande — Petal" && record.edition.includes("Bad World flower-filled"),
      date: "2026 · date not recorded",
      place: "Bad World · one-week vault",
      note: "The vault was open for only one week, and Jay did not want the FOMO of missing Ariana’s first Bad World pressing. The real flowers make it unique in her catalogue—and it is properly stunning in person."
    },
    {
      match: (record) => record.title === "Sabrina Carpenter — Man’s Best Friend" && record.edition.includes("Pink Champagne"),
      date: "2026 · date not recorded",
      place: "Vinted · negotiated resale purchase",
      note: "Jay kept going back and forth with the seller on Vinted until they finally settled on a price. The Bad World Pink Champagne edition is limited to 5,000 worldwide and became his first—and so far only—liquid-filled record."
    },
    {
      match: (record) => /Eternal Sunshine Tour exclusive/.test(record.edition),
      date: "27 August 2026",
      place: "Eternal Sunshine Tour pop-up · London",
      note: "On the morning of Jay’s first tour show, he and Millie reached the London pop-up around 11am and joined a virtual queue already over six hours long. Jay randomly checked the sold-out Eventbrite page at exactly 11:11; a single 12pm slot appeared and he got it. To his knowledge no other ticket reappeared—and, after most vinyl had been unavailable on earlier days, staff announced that the full set had finally been restocked just before they went in."
    },
    {
      match: (record) => record.title === "Ariana Grande — Positions Deluxe" && record.edition.includes("Purple in clear"),
      date: "9 October 2026",
      place: "Vinted · £212.99 delivered",
      note: "After tracking this pressing for ages, Jay finally bought the Purple-in-Clear deluxe on Vinted for £212.99 all-in, including shipping. It remains one of the archive’s biggest grail finds."
    },
    {
      match: (record) => record.title === "Ariana Grande — Christmas & Chill" && record.edition.includes("10th Anniversary"),
      date: "9 October 2026",
      place: "Aftertone Records · Mexico",
      note: "This did not come from Ariana’s official store. Aftertone Records in Mexico personally switched on international delivery so Jay could place the order—a brilliant bit of collector persistence that belongs in the archive."
    },
    {
      match: (record) => record.title === "Ariana Grande — Dangerous Woman" && record.edition.includes("10th Anniversary"),
      date: "October 2026",
      place: "Ariana Grande official store",
      note: "This became the replacement copy after the original Vinted order was cancelled and refunded, so the final record came directly from the official store."
    },
    {
      match: (record) => record.title === "Ariana Grande — Sweetener" && record.edition === "Standard black-vinyl 2LP",
      date: "2026",
      place: "Stylus Records · Lichfield",
      note: "Picked up from an actual local record shop rather than ordered online — a small detail, but exactly the kind of provenance worth keeping."
    },
    {
      match: (record) => record.title === "Wicked: One Wonderful Night",
      date: "October 2026",
      place: "Platomania · Netherlands",
      note: "Ordered from Platomania as the exact RSD live pressing. The real fuchsia-and-green marbling is now documented from photographs of the physical records."
    },
    {
      match: (record) => record.title === "Wicked: The Soundtrack" && record.edition.includes("Collector’s Case discs"),
      date: "2026",
      place: "Owner-assembled configuration",
      note: "Jay’s genuine Collector’s Case Glinda and Elphaba discs are housed in the standard gatefold — the correct discs, carefully documented without pretending it was sold as this combination."
    },
    {
      match: (record) => record.title === "Wicked: For Good — The Soundtrack" && record.edition.includes("Custom configuration"),
      date: "2026",
      place: "Owner-assembled configuration",
      note: "The Yellow Brick Road picture discs were paired with the standard For Good gatefold, creating Jay’s own configuration while keeping the pressing history accurate."
    },
    {
      match: (record) => record.title === "Sienna Spiro — The Visitor" && record.edition.includes("Red vinyl"),
      date: "October 2026",
      place: "Banquet Records",
      note: "The Indies-exclusive alternate-cover red pressing from Banquet Records. This copy is unsigned and has no signed insert or personal dedication; the signed Sienna copy in the collection is the Tangerine edition."
    },
    {
      match: (record) => record.title === "Jamie Miller — Baby Doll",
      date: "10 October 2026",
      place: "Island Records store",
      note: "The blue 7-inch was ordered with its signed Jamie Miller art card — a small-format release with a properly personal extra."
    },
    {
      match: (record) => record.title === "Olivia Dean — Live at the BBC",
      date: "October 2026",
      place: "Banquet Records",
      note: "A Record Store Day live 7-inch bought from Banquet Records, preserving two BBC performances in the collection."
    },
    {
      match: (record) => record.title === "Ariana Grande — Petal" && /Dandelion White|Pepper Yellow/.test(record.edition),
      date: "October 2026",
      place: "Ariana Grande official store",
      note: "The two Petal 7-inch colourways were ordered together as a matching pair, with the shared delivered total divided accurately between them."
    }
  ];

  allRecords.forEach((record) => {
    const entry = collectionJournal.find((item) => item.match(record));
    if (entry) record.journal = { date: entry.date.replace(" · date not recorded", ""), place: entry.place, note: entry.note };
  });

  let wishlistRecords = [
    {
      id: "wishlist-ariana-k-bye-for-now",
      title: "Ariana Grande — k bye for now (swt live)",
      artist: "Ariana Grande",
      edition: "RSD 2021 exclusive · 3LP · limited to 7,500",
      priceText: "Sold out • high priority • wanted",
      price: 0,
      rank: 1,
      wishlist: true,
      highPriority: true,
      extremelyRare: true,
      outOfStock: true,
      description: "Ariana Grande’s first live album, issued as a Record Store Day 2021 exclusive triple-LP set. The pressing was limited to 7,500 copies and documents the Sweetener World Tour.",
      image: "https://dcdn-us.mitiendanube.com/stores/001/610/409/products/image-e18fe763c24b3ee96e16259619362790-480-0.webp",
      imageSource: "https://dcdn-us.mitiendanube.com/stores/001/610/409/products/image-e18fe763c24b3ee96e16259619362790-480-0.webp",
      source: "https://recordstoreday.com/SpecialRelease/13670",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Record Store Day 2021 exclusive" },
        { label: "Record", value: "3LP · limited to 7,500" },
        { label: "Status", value: "Sold out • high priority • wanted" }
      ]
    },
    {
      id: "wishlist-ariana-boyfriend-7",
      title: "Ariana Grande & Social House — Boyfriend",
      artist: "Ariana Grande",
      edition: "2019 limited 7-inch single",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 2,
      wishlist: true,
      extremelyRare: true,
      description: "Limited 2019 seven-inch single edition of Boyfriend by Ariana Grande and Social House, presented in the original photographic picture sleeve.",
      image: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/46/06/a2/4606a277-f7d0-5e34-e8e7-e81d2f40b56a/19UMGIM68896.rgb.jpg/1200x1200bb.jpg",
      imageSource: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/46/06/a2/4606a277-f7d0-5e34-e8e7-e81d2f40b56a/19UMGIM68896.rgb.jpg/1200x1200bb.jpg",
      source: "https://www.discogs.com/release/14556437-Ariana-Grande-Social-House-Boyfriend",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "2019 limited single" },
        { label: "Record", value: "7-inch · 45 RPM" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-ariana-7-rings-7",
      title: "Ariana Grande — 7 rings",
      artist: "Ariana Grande",
      edition: "Clear 7-inch · limited edition",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 3,
      wishlist: true,
      extremelyRare: true,
      description: "Limited seven-inch single pressing of 7 rings on clear vinyl, issued in 2019 with the original pink door artwork.",
      image: "https://pbs.twimg.com/media/FxXnTchWYAE10ok.jpg",
      imageSource: "https://pbs.twimg.com/media/FxXnTchWYAE10ok.jpg",
      source: "https://www.discogs.com/release/13449313-Ariana-Grande-7-Rings",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "2019 limited edition" },
        { label: "Record", value: "7-inch · clear vinyl · 45 RPM" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-ariana-positions-7",
      title: "Ariana Grande — positions",
      artist: "Ariana Grande",
      edition: "Official-store 7-inch · positions / safety net",
      priceText: "US $14.99 · in stock",
      price: 0,
      rank: 4,
      wishlist: true,
      description: "Official-store seven-inch single pairing positions on side A with safety net featuring Ty Dolla $ign on side B. The UK store is sold out; the US store currently lists it at $14.99, with UK delivery and import costs unverified.",
      image: "assets/wishlist-positions-7.png",
      imageSource: "assets/wishlist-positions-7.png",
      source: "https://shop.arianagrande.com/products/positions-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official-store single · 2026" },
        { label: "Record", value: "7-inch · positions / safety net" },
        { label: "Status", value: "UK sold out · US $14.99 in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-ariana-htimylm-white-7",
      title: "Ariana Grande — hate that i made you love me",
      artist: "Ariana Grande",
      edition: "Limited edition · Dandelion White 7-inch",
      priceText: "£12.99 · in stock",
      price: 0,
      rank: 5,
      wishlist: true,
      description: "Limited-edition seven-inch single pressed on Dandelion White vinyl. The A-side features hate that i made you love me, backed with the instrumental version on side B; the separate CD edition carries the a cappella version.",
      image: "assets/wishlist-htimylm-white.png",
      imageSource: "assets/wishlist-htimylm-white.png",
      source: "https://shopuk.arianagrande.com/products/hate-that-i-made-you-love-me-dandelion-white-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited edition · official store" },
        { label: "Record", value: "7-inch · Dandelion White vinyl" },
        { label: "B-side", value: "Instrumental version" },
        { label: "Status", value: "£12.99 · in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-ariana-htimylm-gray-7",
      title: "Ariana Grande — hate that i made you love me",
      artist: "Ariana Grande",
      edition: "Limited edition · Fluffy Tail Gray 7-inch",
      priceText: "£12.99 · in stock",
      price: 0,
      rank: 6,
      wishlist: true,
      description: "Limited-edition seven-inch single pressed on Fluffy Tail Gray vinyl. The A-side features hate that i made you love me, backed with the a cappella version on side B.",
      image: "assets/wishlist-htimylm-gray.png",
      imageSource: "assets/wishlist-htimylm-gray.png",
      source: "https://shopuk.arianagrande.com/products/hate-that-i-made-you-love-me-fluffy-tail-gray-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited edition · official store" },
        { label: "Record", value: "7-inch · Fluffy Tail Gray vinyl" },
        { label: "B-side", value: "A cappella version" },
        { label: "Status", value: "£12.99 · in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-ariana-yes-and-7",
      title: "Ariana Grande — yes, and?",
      artist: "Ariana Grande",
      edition: "Clear 7-inch single",
      priceText: "£9.99 · in stock",
      price: 0,
      rank: 7,
      wishlist: true,
      description: "Official seven-inch single edition of yes, and? pressed on clear vinyl and issued through Island Records.",
      image: "assets/wishlist-yes-and-7.png",
      imageSource: "assets/wishlist-yes-and-7.png",
      source: "https://shopuk.arianagrande.com/products/yes-and-7-vinyl",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official-store single" },
        { label: "Record", value: "7-inch · clear vinyl" },
        { label: "Label", value: "Island Records" },
        { label: "Status", value: "£9.99 · in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-ariana-34-35-7",
      title: "Ariana Grande — 34+35",
      artist: "Ariana Grande",
      edition: "Limited 7-inch · 34+35 / my hair",
      priceText: "US $14.99 · in stock",
      price: 0,
      rank: 8,
      wishlist: true,
      description: "Limited seven-inch single pairing 34+35 on side A with my hair on side B. The UK store is sold out; the US store currently lists it at $14.99, with UK delivery and import costs unverified.",
      image: "assets/wishlist-34-35-7.png",
      imageSource: "assets/wishlist-34-35-7.png",
      source: "https://shop.arianagrande.com/products/34-35-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited official-store single · 2026" },
        { label: "Record", value: "7-inch · translucent white vinyl" },
        { label: "B-side", value: "my hair" },
        { label: "Status", value: "UK sold out · US $14.99 in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-ariana-supernatural-7",
      title: "Ariana Grande — supernatural",
      artist: "Ariana Grande",
      edition: "Clear 7-inch · supernatural / extended intro",
      priceText: "Sold out · UK and US",
      price: 0,
      rank: 9,
      wishlist: true,
      description: "Limited clear seven-inch single pairing supernatural on side A with the extended version of intro (end of the world) on side B.",
      image: "assets/wishlist-supernatural-7.png",
      imageSource: "assets/wishlist-supernatural-7.png",
      source: "https://shopuk.arianagrande.com/products/supernatural-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited official-store single · 2025" },
        { label: "Record", value: "7-inch · clear vinyl" },
        { label: "B-side", value: "intro (end of the world) — extended" },
        { label: "Status", value: "Sold out on UK and US official stores · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-ariana-dandelion-7",
      title: "Ariana Grande — dandelion",
      artist: "Ariana Grande",
      edition: "Clear 7-inch · dandelion / warm",
      priceText: "US $14.99 · in stock",
      price: 0,
      rank: 10,
      wishlist: true,
      description: "Limited clear seven-inch single pairing dandelion on side A with warm on side B. The UK store is sold out; the US store currently lists it at $14.99, with UK delivery and import costs unverified.",
      image: "assets/wishlist-dandelion-7.png",
      imageSource: "assets/wishlist-dandelion-7.png",
      source: "https://shop.arianagrande.com/products/dandelion-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited official-store single · 2025" },
        { label: "Record", value: "7-inch · clear vinyl" },
        { label: "B-side", value: "warm" },
        { label: "Status", value: "UK sold out · US $14.99 in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-ariana-hampstead-7",
      title: "Ariana Grande — Hampstead",
      artist: "Ariana Grande",
      edition: "Clear 7-inch · Hampstead / past life",
      priceText: "US $14.99 · in stock",
      price: 0,
      rank: 11,
      wishlist: true,
      description: "Limited clear seven-inch single pairing Hampstead on side A with past life on side B. The UK store is sold out; the US store currently lists it at $14.99, with UK delivery and import costs unverified.",
      image: "assets/wishlist-hampstead-7.png",
      imageSource: "assets/wishlist-hampstead-7.png",
      source: "https://shop.arianagrande.com/products/hampstead-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited official-store single · 2025" },
        { label: "Record", value: "7-inch · clear vinyl" },
        { label: "B-side", value: "past life" },
        { label: "Status", value: "UK sold out · US $14.99 in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-ariana-twilight-zone-7",
      title: "Ariana Grande — twilight zone",
      artist: "Ariana Grande",
      edition: "Clear 7-inch · original / a cappella",
      priceText: "US $14.99 · in stock",
      price: 0,
      rank: 12,
      wishlist: true,
      description: "Limited clear seven-inch single featuring twilight zone on side A and its a cappella version on side B. The UK store is sold out; the US store currently lists it at $14.99, with UK delivery and import costs unverified.",
      image: "assets/wishlist-twilight-zone-7.jpg",
      imageSource: "assets/wishlist-twilight-zone-7.jpg",
      source: "https://shop.arianagrande.com/products/twilight-zone-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited official-store single · 2025" },
        { label: "Record", value: "7-inch · clear vinyl" },
        { label: "B-side", value: "twilight zone — a cappella" },
        { label: "Status", value: "UK sold out · US $14.99 in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-ariana-wcbf-7",
      title: "Ariana Grande — we can't be friends",
      artist: "Ariana Grande",
      edition: "7-inch · original / string version",
      priceText: "US $13.99 · in stock",
      price: 0,
      rank: 13,
      wishlist: true,
      description: "Limited seven-inch single pairing we can't be friends (wait for your love) with the orchestral string version on side B. The UK store is sold out; the US store currently lists it at $13.99, with UK delivery and import costs unverified.",
      image: "assets/wishlist-wcbf-7.png",
      imageSource: "assets/wishlist-wcbf-7.png",
      source: "https://shop.arianagrande.com/products/we-cant-be-friends-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited official-store single · 2024" },
        { label: "Record", value: "7-inch vinyl" },
        { label: "B-side", value: "String version" },
        { label: "Status", value: "UK sold out · US $13.99 in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-ariana-boy-is-mine-7",
      title: "Ariana Grande — the boy is mine",
      artist: "Ariana Grande",
      edition: "7-inch · original / a cappella",
      priceText: "US $13.99 · in stock",
      price: 0,
      rank: 14,
      wishlist: true,
      description: "Limited seven-inch single featuring the boy is mine on side A and its a cappella version on side B. The UK store is sold out; the US store currently lists it at $13.99, with UK delivery and import costs unverified.",
      image: "assets/wishlist-boy-is-mine-7.png",
      imageSource: "assets/wishlist-boy-is-mine-7.png",
      source: "https://shop.arianagrande.com/products/the-boy-is-mine-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited official-store single · 2024" },
        { label: "Record", value: "7-inch vinyl" },
        { label: "B-side", value: "the boy is mine — a cappella" },
        { label: "Status", value: "UK sold out · US $13.99 in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-ariana-problem-7",
      title: "Ariana Grande — Problem",
      artist: "Ariana Grande",
      edition: "My Everything 10th Anniversary · Pink 7-inch",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 15,
      wishlist: true,
      description: "Tenth-anniversary pink seven-inch single pairing Problem featuring Iggy Azalea with Only 1 on side B.",
      image: "assets/wishlist-problem-7.png",
      imageSource: "assets/wishlist-problem-7.png",
      source: "https://shopuk.arianagrande.com/products/problem-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "My Everything 10th Anniversary" },
        { label: "Record", value: "7-inch · pink vinyl" },
        { label: "B-side", value: "Only 1" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-ariana-break-free-7",
      title: "Ariana Grande — Break Free",
      artist: "Ariana Grande",
      edition: "My Everything 10th Anniversary · Pink 7-inch",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 16,
      wishlist: true,
      description: "Tenth-anniversary pink seven-inch single pairing Break Free featuring Zedd with Break Your Heart Right Back featuring Childish Gambino.",
      image: "assets/wishlist-break-free-7.png",
      imageSource: "assets/wishlist-break-free-7.png",
      source: "https://shopuk.arianagrande.com/products/break-free-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "My Everything 10th Anniversary" },
        { label: "Record", value: "7-inch · pink vinyl" },
        { label: "B-side", value: "Break Your Heart Right Back" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-ariana-love-me-harder-7",
      title: "Ariana Grande — Love Me Harder",
      artist: "Ariana Grande",
      edition: "My Everything 10th Anniversary · Pink 7-inch",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 17,
      wishlist: true,
      description: "Tenth-anniversary pink seven-inch single pairing Love Me Harder featuring The Weeknd with Be My Baby featuring Cashmere Cat.",
      image: "assets/wishlist-love-me-harder-7.png",
      imageSource: "assets/wishlist-love-me-harder-7.png",
      source: "https://shopuk.arianagrande.com/products/love-me-harder-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "My Everything 10th Anniversary" },
        { label: "Record", value: "7-inch · pink vinyl" },
        { label: "B-side", value: "Be My Baby" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-ariana-one-last-time-7",
      title: "Ariana Grande — One Last Time",
      artist: "Ariana Grande",
      edition: "My Everything 10th Anniversary · Pink 7-inch",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 18,
      wishlist: true,
      description: "Tenth-anniversary pink seven-inch single pairing One Last Time with My Everything on side B.",
      image: "assets/wishlist-one-last-time-7.png",
      imageSource: "assets/wishlist-one-last-time-7.png",
      source: "https://shopuk.arianagrande.com/products/one-last-time-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "My Everything 10th Anniversary" },
        { label: "Record", value: "7-inch · pink vinyl" },
        { label: "B-side", value: "My Everything" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-ariana-santa-tell-me-7",
      title: "Ariana Grande — Santa Tell Me",
      artist: "Ariana Grande",
      edition: "10th Anniversary · Amazon-exclusive Gold 7-inch",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 19,
      wishlist: true,
      rare: true,
      limitedEdition: true,
      variant: true,
      outOfStock: true,
      description: "Rare Amazon-exclusive tenth-anniversary seven-inch edition on Gold vinyl, pairing Santa Tell Me with True Love on side B.",
      image: "https://www.einef.fr/cdn/shop/files/ariana_grande_santa_tell_me_gold_7_inch_vinyl.png?v=1786150153&width=1946",
      imageSource: "https://www.einef.fr/cdn/shop/files/ariana_grande_santa_tell_me_gold_7_inch_vinyl.png?v=1786150153&width=1946",
      source: "https://uk.rarevinyl.com/collections/2020s-7-singles-seven-inch-vinyl-singles-45-rpm/products/ariana-grande-santa-tell-me-gold-vinyl-sealed-uk-7-inch-vinyl-single-00602475154457-897651",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "10th Anniversary · Amazon exclusive" },
        { label: "Record", value: "7-inch · Gold vinyl" },
        { label: "B-side", value: "True Love" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-ariana-christmas-and-chill-snow-globe-lp",
      title: "Ariana Grande — Christmas & Chill",
      artist: "Ariana Grande",
      edition: "hmv Exclusive · Snow Globe White Marble Vinyl",
      priceText: "£25.99 · pre-order open",
      price: 0,
      rank: 19.5,
      wishlist: true,
      limitedEdition: true,
      variant: true,
      description: "HMV-exclusive 2026 pressing of Christmas & Chill on Snow Globe White Marble vinyl, featuring Santa Tell Me, True Love, December and Winter Things.",
      image: "https://cdn.hmv.com/r/w-640/p-webp/hmv/files/18/18081c21-c618-4e4a-a6c1-bd43d07ca4ec.jpg",
      imageSource: "https://cdn.hmv.com/r/w-640/p-webp/hmv/files/18/18081c21-c618-4e4a-a6c1-bd43d07ca4ec.jpg",
      source: "https://hmv.com/store/music/vinyl/christmas-chill-%28hmv-exclusive%29-snow-globe-white-m",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "hmv Exclusive · 2026" },
        { label: "Record", value: "12-inch LP · Snow Globe White Marble vinyl" },
        { label: "Release", value: "6 November 2026" },
        { label: "Status", value: "£25.99 pre-order open · free UK delivery over £25 or free Click & Collect · checked 16 October 2026" }
      ]
    },
    {
      id: "wishlist-ariana-thank-u-next-7",
      title: "Ariana Grande — thank u, next",
      artist: "Ariana Grande",
      edition: "Limited Clear 7-inch · thank u, next / imagine",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 20,
      wishlist: true,
      rare: true,
      limitedEdition: true,
      outOfStock: true,
      description: "Limited 2019 clear seven-inch single pairing thank u, next on side A with imagine on side B.",
      image: "https://yaomovinyl.com/cdn/shop/files/NTAtMjk3NS5qcGVn.jpg?v=1786538257&width=1946",
      imageSource: "https://yaomovinyl.com/cdn/shop/files/NTAtMjk3NS5qcGVn.jpg?v=1786538257&width=1946",
      source: "https://www.discogs.com/release/13339823-Ariana-Grande-Thank-U-Next",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "2019 limited edition" },
        { label: "Record", value: "Clear 7-inch · 45 RPM" },
        { label: "B-side", value: "imagine" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-ariana-break-up-girlfriend-7",
      title: "Ariana Grande — break up with your girlfriend, i'm bored",
      artist: "Ariana Grande",
      edition: "Limited Clear 7-inch · explicit / edited",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 21,
      wishlist: true,
      rare: true,
      limitedEdition: true,
      outOfStock: true,
      description: "Limited 2019 clear seven-inch single with the explicit version on side A and the edited version on side B.",
      image: "https://cdn11.bigcommerce.com/s-99klc1qm/images/stencil/1280x1280/products/68467/110536/c0018073__21745.1559465952.jpg?c=2%3Fimbypass%3Don",
      imageSource: "https://cdn11.bigcommerce.com/s-99klc1qm/images/stencil/1280x1280/products/68467/110536/c0018073__21745.1559465952.jpg?c=2%3Fimbypass%3Don",
      source: "https://earcandymusic.biz/ariana-grande-break-up-with-your-girlfriend-im-bored-7-clear-vinyl/",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "2019 limited edition" },
        { label: "Record", value: "Clear 7-inch · 45 RPM" },
        { label: "B-side", value: "Edited version" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-ariana-stuck-with-u-glow-7",
      title: "Ariana Grande & Justin Bieber — Stuck with U",
      artist: "Ariana Grande",
      edition: "Alternate Glow Cover · limited 7-inch",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 25,
      wishlist: true,
      rare: true,
      limitedEdition: true,
      variant: true,
      outOfStock: true,
      description: "The alternate Glow Cover edition of the 2020 Stuck with U charity seven-inch single.",
      image: "https://i.ebayimg.com/images/g/Y1sAAOSwHXRfyEmi/s-l1200.jpg",
      imageSource: "https://i.ebayimg.com/images/g/Y1sAAOSwHXRfyEmi/s-l1200.jpg",
      source: "https://www.discogs.com/release/16262392-Ariana-Grande-Justin-Bieber-Stuck-With-U",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Alternate Glow Cover · 2020" },
        { label: "Record", value: "Black 7-inch · 45 RPM" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-ariana-dont-call-me-angel-7",
      title: "Ariana Grande, Miley Cyrus & Lana Del Rey — Don't Call Me Angel",
      artist: "Ariana Grande",
      edition: "Limited 7-inch · original / instrumental",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 26,
      wishlist: true,
      rare: true,
      limitedEdition: true,
      outOfStock: true,
      description: "Limited seven-inch single of Don't Call Me Angel from Charlie's Angels, backed with the instrumental version.",
      image: "https://product.hstatic.net/1000304920/product/ey-miley-cyrus-dont-call-me-angel-charlie_s_angels_vinyl-single-7-inch_9375ac611a354bdb90f7d00c45ab970e_master.png",
      imageSource: "https://product.hstatic.net/1000304920/product/ey-miley-cyrus-dont-call-me-angel-charlie_s_angels_vinyl-single-7-inch_9375ac611a354bdb90f7d00c45ab970e_master.png",
      source: "https://musicbrainz.org/release-group/8884b010-24e7-424e-a30a-e21934ff67d7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "2019 limited single" },
        { label: "Record", value: "Black 7-inch · 45 RPM" },
        { label: "B-side", value: "Instrumental version" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-ariana-rain-on-me-yellow-7",
      title: "Lady Gaga & Ariana Grande — Rain On Me",
      artist: "Ariana Grande",
      edition: "Limited Translucent Yellow 7-inch",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 27,
      wishlist: true,
      rare: true,
      limitedEdition: true,
      variant: true,
      outOfStock: true,
      description: "Official Lady Gaga store-exclusive translucent-yellow seven-inch single, backed with the instrumental version.",
      image: "https://images.tcdn.com.br/img/img_prod/883587/lady_gaga_feat_ariana_grande_rain_on_me_limited_edition_7_yellow_vinyl_single_webstore_exclusive_5973_1_9ede2c7d68d692eed1136391e34aecf6.jpeg",
      imageSource: "https://images.tcdn.com.br/img/img_prod/883587/lady_gaga_feat_ariana_grande_rain_on_me_limited_edition_7_yellow_vinyl_single_webstore_exclusive_5973_1_9ede2c7d68d692eed1136391e34aecf6.jpeg",
      source: "https://www.ladygagaxcollection.com/chromatica-singles/rain-on-me-7-vinyl",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Lady Gaga US store exclusive · 2020" },
        { label: "Record", value: "Translucent Yellow 7-inch · 45 RPM" },
        { label: "B-side", value: "Instrumental version" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-ariana-santa-cant-you-hear-me-flexi",
      title: "Kelly Clarkson & Ariana Grande — Santa, Can't You Hear Me",
      artist: "Ariana Grande",
      edition: "Limited Green 7-inch Flexi Disc",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 29,
      wishlist: true,
      rare: true,
      limitedEdition: true,
      outOfStock: true,
      description: "Official limited green flexi-disc single of Kelly Clarkson and Ariana Grande's Santa, Can't You Hear Me collaboration.",
      image: "https://store.warnermusic.com/cdn/shop/files/KC-Holiday_ProductImages-WCCA_SCYHM-Flexi_205.31.45_20PM_20_282_29.png?v=1735499895&width=1024",
      imageSource: "https://store.warnermusic.com/cdn/shop/files/KC-Holiday_ProductImages-WCCA_SCYHM-Flexi_205.31.45_20PM_20_282_29.png?v=1735499895&width=1024",
      source: "https://store.warnermusic.com/products/santa-cant-you-hear-me-feat-ariana-grande-flexi-disc",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official Warner Music Store release" },
        { label: "Record", value: "Green 7-inch flexi disc" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-sienna-great-expectation",
      title: "Sienna Spiro — Great Expectations",
      artist: "Sienna Spiro",
      edition: "Awaiting a standalone vinyl release",
      priceText: "Release watch",
      price: 0,
      rank: 20,
      wishlist: true,
      description: "Great Expectations is available on Visitor and as a CD single, but no standalone vinyl pressing has been announced. Kept here as a release watch rather than an imaginary variant.",
      image: "assets/release-watch-great-expectations-cd.webp",
      imageSource: "assets/release-watch-great-expectations-cd.webp",
      source: "https://shopuk.officialsiennaspiro.com/",
      category: "Wishlist",
      facts: [
        { label: "Current format", value: "CD single · album track on Visitor" },
        { label: "Vinyl", value: "No standalone pressing announced" },
        { label: "Status", value: "Watch for a vinyl release" }
      ]
    },
    {
      id: "wishlist-sienna-maybe-7",
      title: "Sienna Spiro — Maybe",
      artist: "Sienna Spiro",
      edition: "First pressing · Midnight Black 7-inch",
      priceText: "US $15.00 · in stock",
      price: 0,
      rank: 21,
      wishlist: true,
      description: "First seven-inch pressing of Maybe on Midnight Black vinyl, pairing the studio recording with the Live from the Mews performance. The UK store is sold out; the US official store currently lists it at $15.00, with UK delivery and import costs unverified.",
      image: "assets/wishlist-sienna-maybe.png",
      imageSource: "assets/wishlist-sienna-maybe.png",
      source: "https://shopus.officialsiennaspiro.com/products/maybe-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "First pressing" },
        { label: "Record", value: "7-inch · Midnight Black vinyl" },
        { label: "Status", value: "UK sold out · US $15.00 in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-sienna-die-on-this-hill-7",
      title: "Sienna Spiro — Die On This Hill",
      artist: "Sienna Spiro",
      edition: "Signed Sunset Orange 7-inch",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 22,
      wishlist: true,
      description: "First limited seven-inch pressing of Die On This Hill on Sunset Orange vinyl, issued through Sienna Spiro’s official store with signed copies available while stocks lasted.",
      image: "assets/wishlist-sienna-die-on-this-hill.png",
      imageSource: "assets/wishlist-sienna-die-on-this-hill.png",
      source: "https://shopus.officialsiennaspiro.com/products/die-on-this-hill-signed-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "First limited pressing · signed" },
        { label: "Record", value: "7-inch · Sunset Orange vinyl" },
        { label: "Status", value: "Signed pressing sold out on UK and US official stores · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-sienna-visitor-7",
      title: "Sienna Spiro — The Visitor",
      artist: "Sienna Spiro",
      edition: "Limited colour-vinyl 7-inch",
      priceText: "£14.99 · in stock",
      price: 0,
      rank: 23,
      wishlist: true,
      description: "Limited colour-vinyl seven-inch single of The Visitor, backed with the instrumental version on side B.",
      image: "assets/wishlist-sienna-visitor-7.png",
      imageSource: "assets/wishlist-sienna-visitor-7.png",
      source: "https://shopuk.officialsiennaspiro.com/products/the-visitor-7-single",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited colour-vinyl single" },
        { label: "Record", value: "7-inch · The Visitor / instrumental" },
        { label: "Status", value: "£14.99 · in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-sienna-material-lover-7",
      title: "Sienna Spiro — Material Lover",
      artist: "Sienna Spiro",
      edition: "Collectable 7-inch single",
      priceText: "Sold out · £14.99",
      price: 0,
      rank: 24,
      wishlist: true,
      outOfStock: true,
      description: "Collectable seven-inch edition of Material Lover, one of the original songs written for The Devil Wears Prada 2 soundtrack. The official UK-store pressing is currently sold out.",
      image: "assets/wishlist-sienna-material-lover.png",
      imageSource: "assets/wishlist-sienna-material-lover.png",
      source: "https://shopuk.officialsiennaspiro.com/products/material-lover-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official-store collectable single" },
        { label: "Record", value: "7-inch vinyl" },
        { label: "Status", value: "Sold out · last listed at £14.99" },
        { label: "Checked", value: "18 October 2026 · official UK store" }
      ]
    },
    {
      id: "wishlist-sienna-visitor-deluxe-yellow-lp",
      title: "Sienna Spiro — Visitor (Deluxe Unplugged)",
      artist: "Sienna Spiro",
      edition: "Buttery Yellow Vinyl · new artwork",
      priceText: "£25.99 · pre-order open",
      price: 0,
      rank: 25,
      wishlist: true,
      limitedEdition: true,
      variant: true,
      description: "The deluxe unplugged edition of Visitor with additional exclusive tracks, new artwork and a buttery-yellow vinyl pressing.",
      image: "https://shopuk.officialsiennaspiro.com/cdn/shop/files/yellow_lp.png?v=1791908825&width=400",
      imageSource: "https://shopuk.officialsiennaspiro.com/cdn/shop/files/yellow_lp.png?v=1791908825&width=400",
      source: "https://shopuk.officialsiennaspiro.com/collections/music/products/visitor-deluxe-unplugged-yellow-vinyl",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Visitor (Deluxe Unplugged) · Yellow Vinyl" },
        { label: "Record", value: "Buttery Yellow LP · new artwork" },
        { label: "Release", value: "11 December 2026" },
        { label: "Status", value: "£25.99 pre-order open · UK official store · shipping at checkout · checked 15 October 2026" }
      ]
    },
    {
      id: "wishlist-sienna-visitor-deluxe-picture-disc",
      title: "Sienna Spiro — Visitor (Deluxe Unplugged)",
      artist: "Sienna Spiro",
      edition: "Store Exclusive Picture Disc",
      priceText: "£27.99 · pre-order open",
      price: 0,
      rank: 26,
      wishlist: true,
      limitedEdition: true,
      variant: true,
      description: "The official-store-exclusive picture-disc edition of Visitor (Deluxe Unplugged), featuring the additional unplugged tracks and My House tour artwork.",
      image: "https://shopuk.officialsiennaspiro.com/cdn/shop/files/pd.png?v=1792052462&width=400",
      imageSource: "https://shopuk.officialsiennaspiro.com/cdn/shop/files/pd.png?v=1792052462&width=400",
      source: "https://shopuk.officialsiennaspiro.com/collections/music/products/visitor-deluxe-unplugged-store-exclusive-picture-disc",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official UK Store Exclusive" },
        { label: "Record", value: "Visitor (Deluxe Unplugged) Picture Disc" },
        { label: "Release", value: "11 December 2026" },
        { label: "Status", value: "£27.99 pre-order open · shipping at checkout · checked 15 October 2026" }
      ]
    },
    {
      id: "wishlist-rein-me-in-black-7",
      title: "Sam Fender & Olivia Dean — Rein Me In",
      artist: "Sam Fender & Olivia Dean",
      edition: "RSD Black Friday 2025 exclusive · Black 7-inch",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 25,
      wishlist: true,
      rare: true,
      limitedEdition: true,
      description: "Rare Record Store Day Black Friday 2025 seven-inch single featuring the Olivia Dean reworking of Rein Me In, backed with their live performance from London Stadium.",
      image: "assets/wishlist-rein-me-in.jpg",
      imageSource: "assets/wishlist-rein-me-in.jpg",
      source: "https://www.recordstoreday.co.uk/release/sam-fender-olivia-dean-rein-me-in",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "RSD Black Friday 2025 exclusive" },
        { label: "Record", value: "7-inch · black vinyl" },
        { label: "Status", value: "Sold out · wanted" }
      ]
    },
    {
      id: "wishlist-olivia-baby-steps-7",
      title: "Olivia Dean — Baby Steps",
      artist: "Olivia Dean",
      edition: "Orange 7-inch · limited single",
      priceText: "£12.99 · in stock",
      price: 0,
      rank: 26,
      wishlist: true,
      description: "Limited seven-inch single pressed on orange vinyl. Baby Steps appears on side A, backed with A Couple Minutes (A COLORS SHOW) on side B.",
      image: "assets/wishlist-baby-steps-7.png",
      imageSource: "assets/wishlist-baby-steps-7.png",
      source: "https://shop.oliviadeano.com/products/baby-steps-7-single",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited official-store single" },
        { label: "Record", value: "7-inch · orange vinyl" },
        { label: "B-side", value: "A Couple Minutes (A COLORS SHOW)" },
        { label: "Status", value: "£12.99 · in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-amy-back-to-black-flower",
      title: "Amy Winehouse — Back To Black",
      artist: "Amy Winehouse",
      edition: "20th Anniversary · Bad World flower-filled LP",
      priceText: "Vault closed · wanted",
      price: 0,
      rank: 27,
      wishlist: true,
      rare: true,
      limitedEdition: true,
      outOfStock: true,
      description: "Bad World 20th-anniversary single-LP edition of Back To Black, manufactured as a dry-filled pressing containing real flowers. The release is scheduled for October 2026.",
      image: "assets/wishlist-amy-back-to-black.png",
      imageSource: "assets/wishlist-amy-back-to-black.png",
      source: "https://bad-world.co.uk/products/amywinehouse",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "20th Anniversary · Bad World" },
        { label: "Record", value: "LP · flower-filled dry pressing" },
        { label: "Status", value: "Vault closed · wanted" }
      ]
    },
    {
      id: "wishlist-sabrina-manchild-7",
      title: "Sabrina Carpenter — Manchild",
      artist: "Sabrina Carpenter",
      edition: "Clear transparent 7-inch · Manchild / exclusive B-side",
      priceText: "US $13.98 · in stock",
      price: 0,
      rank: 11,
      wishlist: true,
      description: "Clear 7-inch single with Manchild on side A and the exclusive spoken B-side ‘inside of your head when you’ve just won an argument with a man’. The UK listing is unavailable; the US official store currently lists it at $13.98, with UK delivery and import costs unverified.",
      image: "https://store.sabrinacarpenter.com/cdn/shop/files/440O8MSb8mS4Lv0atUvfXpK3qAkKf68c-1.png?v=1748975229&width=1154",
      imageSource: "https://store.sabrinacarpenter.com/cdn/shop/files/440O8MSb8mS4Lv0atUvfXpK3qAkKf68c-1.png?v=1748975229&width=1154",
      source: "https://store.sabrinacarpenter.com/products/manchild-7in-single",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official-store single" },
        { label: "Record", value: "Clear transparent 7-inch" },
        { label: "Status", value: "UK unavailable · US $13.98 in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-sabrina-short-n-sweet-standard-lp",
      title: "Sabrina Carpenter — Short n' Sweet",
      artist: "Sabrina Carpenter",
      edition: "Standard LP · Light Sky vinyl",
      priceText: "£29.99 · in stock",
      price: 0,
      rank: 2,
      wishlist: true,
      description: "The standard UK edition on Light Sky vinyl, with gatefold sleeve, insert, poster and vinyl sleeve.",
      image: "https://shopuk.sabrinacarpenter.com/cdn/shop/files/large-STANDARDLP_FRONT.png?v=1762788006&width=1280",
      imageSource: "https://shopuk.sabrinacarpenter.com/cdn/shop/files/large-STANDARDLP_FRONT.png?v=1762788006&width=1280",
      source: "https://shopuk.sabrinacarpenter.com/collections/short-n-sweet/products/short-n-sweet-standard-lp",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "UK official-store standard edition" },
        { label: "Record", value: "LP · Light Sky vinyl" },
        { label: "Status", value: "£29.99 · in stock · checked 10 October 2026" }
      ]
    },
    {
      id: "wishlist-sabrina-short-n-sweet-deluxe-2lp",
      title: "Sabrina Carpenter — Short n' Sweet (Deluxe)",
      artist: "Sabrina Carpenter",
      edition: "US D2C Exclusive 2LP · Pearl vinyl · Oh So Hot cover",
      priceText: "US $45.99 · in stock",
      price: 0,
      rank: 3,
      wishlist: true,
      limitedEdition: true,
      variant: true,
      description: "The exact official US-store D2C deluxe 2LP: the alternate Oh So Hot cover with Sabrina's lipstick kiss, two Pearl opaque discs, gatefold image, insert, poster and vinyl sleeves.",
      image: "https://store.sabrinacarpenter.com/cdn/shop/files/SNSD2C_Front01.png?v=1746201913&width=1000",
      imageSource: "https://store.sabrinacarpenter.com/cdn/shop/files/SNSD2C_Front01.png?v=1746201913&width=1000",
      source: "https://store.sabrinacarpenter.com/products/short-n-sweet-deluxe-d2c-exclusive-2lp",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "US official-store D2C exclusive · Oh So Hot cover" },
        { label: "Record", value: "2LP · Pearl opaque vinyl" },
        { label: "Status", value: "$45.99 · in stock · checked 12 October 2026 · UK delivery/import costs unverified" }
      ]
    },
    {
      id: "wishlist-sabrina-short-n-sweet-anniversary-lp",
      title: "Sabrina Carpenter — Short n' Sweet",
      artist: "Sabrina Carpenter",
      edition: "Collector's Anniversary Edition · lips-filled vinyl",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 5,
      wishlist: true,
      rare: true,
      limitedEdition: true,
      variant: true,
      outOfStock: true,
      description: "Limited anniversary edition with an embossed slipcase, red holographic lips, lips-filled vinyl, reflective poster and insert. The UK store currently marks it sold out.",
      image: "https://shopuk.sabrinacarpenter.com/cdn/shop/files/snsanniLP.png?v=1787579705&width=1000",
      imageSource: "https://shopuk.sabrinacarpenter.com/cdn/shop/files/snsanniLP.png?v=1787579705&width=1000",
      source: "https://shopuk.sabrinacarpenter.com/products/short-n-sweet-collectors-anniversary-edition-lp",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited collector's anniversary pressing" },
        { label: "Record", value: "LP · lips-filled vinyl" },
        { label: "Status", value: "Sold out on UK and US official stores · checked 12 October 2026" },
        { label: "Last listed", value: "£69.99 at Sabrina Carpenter UK" }
      ]
    },
    {
      id: "wishlist-sabrina-short-n-sweet-alternate-cover-lp",
      title: "Sabrina Carpenter — Short n' Sweet",
      artist: "Sabrina Carpenter",
      edition: "D2C Exclusive · Alternate Cover · Vintage Bottle Disc LP",
      priceText: "US $32.99 · in stock",
      price: 0,
      rank: 4,
      wishlist: true,
      description: "Official store-exclusive Short n' Sweet LP with the vintage bottle disc design, alternate gatefold image and postcard. The US product page offers it for sale; UK delivery and any import charges need confirming at checkout.",
      image: "https://store.sabrinacarpenter.com/cdn/shop/files/alt-cover.png?v=1746201658&width=1000",
      imageSource: "https://store.sabrinacarpenter.com/cdn/shop/files/alt-cover.png?v=1746201658&width=1000",
      source: "https://store.sabrinacarpenter.com/collections/exclusive-vinyl/products/short-n-sweet-alternate-cover-lp",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official store D2C exclusive" },
        { label: "Record", value: "LP · alternate gatefold · vintage bottle disc" },
        { label: "US list price", value: "$32.99 · UK delivery/import costs unverified" },
        { label: "Status", value: "In stock on US product page · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-sabrina-house-tour-7",
      title: "Sabrina Carpenter — House Tour",
      artist: "Sabrina Carpenter",
      edition: "Ballerina Pink 7-inch · exclusive remix B-side",
      priceText: "US $13.98 · in stock",
      price: 0,
      rank: 6,
      wishlist: true,
      description: "Official US-store 7-inch from Man's Best Friend, with House Tour backed by the exclusive Back Door (Fcukers Remix). UK stock and delivery are not confirmed.",
      image: "https://store.sabrinacarpenter.com/cdn/shop/files/Untitled-1-Recovered-2.png?v=1775487206&width=1000",
      imageSource: "https://store.sabrinacarpenter.com/cdn/shop/files/Untitled-1-Recovered-2.png?v=1775487206&width=1000",
      source: "https://store.sabrinacarpenter.com/collections/7-vinyl/products/house-tour-7in-single",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official US-store single · Ballerina Pink" },
        { label: "Record", value: "7-inch · House Tour / Back Door (Fcukers Remix)" },
        { label: "US list price", value: "$13.98 · UK delivery unverified" },
        { label: "Status", value: "In stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-sabrina-tears-7",
      title: "Sabrina Carpenter — Tears",
      artist: "Sabrina Carpenter",
      edition: "Opaque Red 7-inch · Tears / Extended Dance Break",
      priceText: "US $13.98 · in stock",
      price: 0,
      rank: 7,
      wishlist: true,
      description: "Official US-store red 7-inch single from Man's Best Friend, backed with Tears (Extended Dance Break). UK stock and delivery are not confirmed.",
      image: "https://store.sabrinacarpenter.com/cdn/shop/files/pVcZm7tdDfqcuDVsUTK5vRFyr5jKBEcD.png?v=1757603961&width=1000",
      imageSource: "https://store.sabrinacarpenter.com/cdn/shop/files/pVcZm7tdDfqcuDVsUTK5vRFyr5jKBEcD.png?v=1757603961&width=1000",
      source: "https://store.sabrinacarpenter.com/collections/7-vinyl/products/tears-7in-single",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official US-store single · opaque red vinyl" },
        { label: "Record", value: "7-inch · Tears / Extended Dance Break" },
        { label: "US list price", value: "$13.98 · UK delivery unverified" },
        { label: "Status", value: "In stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-sabrina-bed-chem-7",
      title: "Sabrina Carpenter — Bed Chem",
      artist: "Sabrina Carpenter",
      edition: "Silver 7-inch · Bed Chem / instrumental",
      priceText: "US $14.98 · in stock",
      price: 0,
      rank: 8,
      wishlist: true,
      description: "Official US-store silver 7-inch with Bed Chem on side A and the instrumental on side B. UK stock and delivery are not confirmed.",
      image: "https://store.sabrinacarpenter.com/cdn/shop/files/BedChem_Front01.png?v=1741363151&width=1000",
      imageSource: "https://store.sabrinacarpenter.com/cdn/shop/files/BedChem_Front01.png?v=1741363151&width=1000",
      source: "https://store.sabrinacarpenter.com/collections/7-vinyl/products/bed-chem-7in",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official US-store single · silver vinyl" },
        { label: "Record", value: "7-inch · Bed Chem / instrumental" },
        { label: "US list price", value: "$14.98 · UK delivery unverified" },
        { label: "Status", value: "In stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-sabrina-taste-7",
      title: "Sabrina Carpenter — Taste",
      artist: "Sabrina Carpenter",
      edition: "Taste 7-inch · Taste / demo",
      priceText: "US $14.98 · in stock",
      price: 0,
      rank: 9,
      wishlist: true,
      description: "Official US-store 7-inch single with Taste backed by its demo. UK stock and delivery are not confirmed.",
      image: "https://store.sabrinacarpenter.com/cdn/shop/files/Taste_Front01.png?v=1741362598&width=1000",
      imageSource: "https://store.sabrinacarpenter.com/cdn/shop/files/Taste_Front01.png?v=1741362598&width=1000",
      source: "https://store.sabrinacarpenter.com/collections/7-vinyl/products/taste-7in-single",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official US-store single" },
        { label: "Record", value: "7-inch · Taste / demo" },
        { label: "US list price", value: "$14.98 · UK delivery unverified" },
        { label: "Status", value: "In stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-sabrina-please-please-please-7",
      title: "Sabrina Carpenter — Please Please Please",
      artist: "Sabrina Carpenter",
      edition: "Day Glow 7-inch · acoustic B-side",
      priceText: "US $14.98 · in stock",
      price: 0,
      rank: 10,
      wishlist: true,
      description: "Official US-store Day Glow 7-inch single with Please Please Please on side A and the acoustic version on side B. UK stock and delivery are not confirmed.",
      image: "https://store.sabrinacarpenter.com/cdn/shop/files/Please_Front01.png?v=1741362967&width=1000",
      imageSource: "https://store.sabrinacarpenter.com/cdn/shop/files/Please_Front01.png?v=1741362967&width=1000",
      source: "https://store.sabrinacarpenter.com/collections/7-vinyl/products/please-please-please-7-single",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official US-store single · Day Glow vinyl" },
        { label: "Record", value: "7-inch · original / acoustic" },
        { label: "US list price", value: "$14.98 · UK delivery unverified" },
        { label: "Status", value: "In stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-sabrina-espresso-liquid-filled-lp",
      title: "Sabrina Carpenter — Espresso",
      artist: "Sabrina Carpenter",
      edition: "2 Year Anniversary · numbered espresso-filled 12-inch",
      priceText: "Vault closed · £45.00",
      price: 0,
      rank: 1,
      wishlist: true,
      highPriority: true,
      rare: true,
      limitedEdition: true,
      variant: true,
      outOfStock: true,
      description: "Bad World’s 24-hour preorder for Espresso’s second anniversary: a hand-numbered 12-inch filled with espresso-coloured liquid and housed in a glitter-board variant sleeve. The vault is now closed.",
      image: "https://bad-world.co.uk/cdn/shop/files/sc2-SQUARE.png?v=1787840465&width=850",
      imageSource: "https://bad-world.co.uk/cdn/shop/files/sc2-SQUARE.png?v=1787840465&width=850",
      source: "https://bad-world.co.uk/products/sc",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Bad World · 2 Year Anniversary Edition" },
        { label: "Record", value: "12-inch · liquid-filled · hand-numbered" },
        { label: "Tracks", value: "Espresso / Espresso (On Vacation)" },
        { label: "Status", value: "Vault closed · last listed at £45.00" }
      ]
    },
    {
      id: "wishlist-sabrina-nonsense-christmas-7",
      title: "Sabrina Carpenter — Nonsense / A Nonsense Christmas",
      artist: "Sabrina Carpenter",
      edition: "Limited 7-inch single",
      priceText: "US $13.98 · in stock",
      price: 0,
      rank: 12,
      wishlist: true,
      description: "Official-store 7-inch single pairing Nonsense with A Nonsense Christmas. The US store lists it; UK availability and delivery need checking.",
      image: "https://store.sabrinacarpenter.com/cdn/shop/files/nonsense.png?v=1733242471&width=1000",
      imageSource: "https://store.sabrinacarpenter.com/cdn/shop/files/nonsense.png?v=1733242471&width=1000",
      source: "https://store.sabrinacarpenter.com/collections/vinyl/products/nonsense-a-nonsense-christmas-7in",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official-store single" },
        { label: "Record", value: "7-inch · Nonsense / A Nonsense Christmas" },
        { label: "US list price", value: "$13.98 · UK delivery unverified" },
        { label: "Status", value: "In stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-sabrina-feather-pink-glitter-7",
      title: "Sabrina Carpenter — Feather",
      artist: "Sabrina Carpenter",
      edition: "Pink Glitter 7-inch · Feather / sped up",
      priceText: "Sold out · US $22.98",
      price: 0,
      rank: 13,
      wishlist: true,
      rare: true,
      description: "Official Sabrina Carpenter Store Pink Glitter 7-inch, with Feather and the sped-up version. The US store currently marks it sold out; UK availability and import costs are unconfirmed.",
      image: "https://store.sabrinacarpenter.com/cdn/shop/files/Feather_Front02.png?v=1741363067&width=1000",
      imageSource: "https://store.sabrinacarpenter.com/cdn/shop/files/Feather_Front02.png?v=1741363067&width=1000",
      source: "https://store.sabrinacarpenter.com/products/feather-7-vinyl",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official-store Pink Glitter single" },
        { label: "Record", value: "7-inch · Feather / Feather (sped up)" },
        { label: "US list price", value: "$22.98 · UK delivery/import costs unverified" },
        { label: "Status", value: "Sold out on US store · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-olivia-art-of-loving-blood-swirl",
      title: "Olivia Dean — The Art of Loving",
      artist: "Olivia Dean",
      edition: "Blood Records · numbered Pink & White Swirl LP",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 27,
      wishlist: true,
      rare: true,
      description: "Blood Records special-effect Pink & White Swirl pressing with a 16-page booklet, limited to 3,000 and hand-numbered. This is a different variant from your Sunset Orange copy; Blood Records shows the edition sold out.",
      image: "https://blood-records.co.uk/cdn/shop/files/BLOOD517-OLIVIADEAN-SITE2-SQUARE.png?v=1787674762&width=128",
      imageSource: "https://blood-records.co.uk/cdn/shop/files/BLOOD517-OLIVIADEAN-SITE2-SQUARE.png?v=1787674762&width=128",
      source: "https://blood-records.co.uk/products/oliviadean",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Blood Records numbered special-effect edition" },
        { label: "Record", value: "LP · Pink & White Swirl · limited to 3,000" },
        { label: "Status", value: "Sold out · £34.99 before shipping" }
      ]
    },
    {
      id: "wishlist-olivia-art-of-loving-silver-anniversary",
      title: "Olivia Dean — The Art of Loving",
      artist: "Olivia Dean",
      edition: "Limited Anniversary Edition · 180g Silver LP",
      priceText: "£32.99 · in stock",
      price: 0,
      rank: 28,
      wishlist: true,
      description: "A limited one-year anniversary half-speed master cut at Metropolis Studios and pressed on heavyweight 180g silver vinyl. This is a different colourway from your Sunset Orange edition.",
      image: "https://shop.oliviadeano.com/cdn/shop/files/Olivia_Dean_-_The_Art_Of_Loving_-_1LP_-_Half-Speed___Silver_Vinyl_-_00199957638203_-_All_Partners_-_1.png?v=1789661226&width=1500",
      imageSource: "https://shop.oliviadeano.com/cdn/shop/files/Olivia_Dean_-_The_Art_Of_Loving_-_1LP_-_Half-Speed___Silver_Vinyl_-_00199957638203_-_All_Partners_-_1.png?v=1789661226&width=1500",
      source: "https://shop.oliviadeano.com/products/the-art-of-loving-limited-anniversary-edition-half-speed-master-180g-silver-vinyl",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited anniversary half-speed master" },
        { label: "Record", value: "180g Silver LP" },
        { label: "Status", value: "£32.99 · in stock · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-amy-back-to-black-20-clear-3lp",
      title: "Amy Winehouse — Back To Black",
      artist: "Amy Winehouse",
      edition: "20th Anniversary · Deluxe Clear 3LP",
      priceText: "£51.99 · pre-order open",
      price: 0,
      rank: 28,
      wishlist: true,
      description: "Official anniversary set with the original album, unreleased demos, B-sides and the full Paradiso Amsterdam 2007 show. The UK official store lists release on 23 October 2026.",
      image: "https://store.amywinehouse.com/cdn/shop/files/AW_3LP_f5433c52-8b36-4570-b97c-c1208fcd78ac.png?v=1787644267&width=1250",
      imageSource: "https://store.amywinehouse.com/cdn/shop/files/AW_3LP_f5433c52-8b36-4570-b97c-c1208fcd78ac.png?v=1787644267&width=1250",
      source: "https://store.amywinehouse.com/products/back-to-black-20-deluxe-clear-vinyl-3lp",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official Back To Black 20 anniversary edition" },
        { label: "Record", value: "3LP · clear vinyl" },
        { label: "Status", value: "£51.99 pre-order open · checked 12 October 2026 · release 23 October 2026" }
      ]
    },
    {
      id: "wishlist-amy-back-to-black-valerie-clear-7",
      title: "Amy Winehouse — Back To Black / Valerie",
      artist: "Amy Winehouse",
      edition: "Spotify Fans First · Clear 7-inch",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 30,
      wishlist: true,
      rare: true,
      description: "Clear 7-inch single pairing Back To Black with Amy's Radio 1 Live Lounge performance of Valerie. The official UK store lists it sold out at £15.99.",
      image: "https://store.amywinehouse.com/cdn/shop/files/00602465342635_1.png?v=1786978213&width=1250",
      imageSource: "https://store.amywinehouse.com/cdn/shop/files/00602465342635_1.png?v=1786978213&width=1250",
      source: "https://store.amywinehouse.com/products/back-to-black-7-clear-vinyl",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Spotify Fans First official-store single" },
        { label: "Record", value: "Clear 7-inch · Back To Black / Valerie (Live at BBC Radio 1)" },
        { label: "Status", value: "Sold out · last listed £15.99 · checked 12 October 2026" }
      ]
    },
    {
      id: "wishlist-amy-back-to-black-20-zoetrope-lp",
      title: "Amy Winehouse — Back To Black",
      artist: "Amy Winehouse",
      edition: "20th Anniversary · Zoetrope LP",
      priceText: "£35.99 · pre-order open",
      price: 0,
      rank: 29,
      wishlist: true,
      description: "A zoetrope picture-effect edition with moving imagery from the official Back To Black 20th-anniversary range. It is currently available from the official UK store; release is scheduled for 23 October 2026.",
      image: "https://store.amywinehouse.com/cdn/shop/files/AW_Zoetrope.png?v=1787570047&width=1250",
      imageSource: "https://store.amywinehouse.com/cdn/shop/files/AW_Zoetrope.png?v=1787570047&width=1250",
      source: "https://store.amywinehouse.com/products/back-to-black-20-zoetrope-vinyl-lp",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official-store zoetrope edition" },
        { label: "Record", value: "LP · animated zoetrope effect" },
        { label: "Status", value: "£35.99 pre-order open · checked 12 October 2026 · release 23 October 2026" }
      ]
    },
    {
      id: "wishlist-chappell-midwest-princess-3yr-lp",
      title: "Chappell Roan — The Rise and Fall of a Midwest Princess",
      artist: "Chappell Roan",
      edition: "3 Year Anniversary · My Kink Is Coral LP",
      priceText: "£59.99 · in stock",
      price: 0,
      rank: 1,
      wishlist: true,
      description: "A limited anniversary edition with a foil slipcase, My Kink Is Coral vinyl, one of four posters, an anniversary sticker and a live digital download.",
      image: "https://shopuk.iamchappellroan.com/cdn/shop/files/CR_MWP3_mock-2_1.png?v=1790089054&width=1000",
      imageSource: "https://shopuk.iamchappellroan.com/cdn/shop/files/CR_MWP3_mock-2_1.png?v=1790089054&width=1000",
      source: "https://shopuk.iamchappellroan.com/products/the-rise-and-fall-of-a-midwest-princess-3-yr-anniversary-lp-1",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "UK-only 3-year anniversary edition" },
        { label: "Record", value: "LP · My Kink Is Coral" },
        { label: "Status", value: "£59.99 · in stock · checked 10 October 2026" }
      ]
    },
    {
      id: "wishlist-chappell-pink-pony-club-7",
      title: "Chappell Roan — Pink Pony Club",
      artist: "Chappell Roan",
      edition: "Baby Pink 7-inch · Naked In Manhattan B-side",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 2,
      wishlist: true,
      description: "The official UK-store 7-inch in baby pink, with Naked In Manhattan on side B. A very strong fit for your pop 7-inch collection.",
      image: "https://shopuk.iamchappellroan.com/cdn/shop/files/Chappell_Roan_Pink_Pony_Club_7in.png?v=1754056761&width=1000",
      imageSource: "https://shopuk.iamchappellroan.com/cdn/shop/files/Chappell_Roan_Pink_Pony_Club_7in.png?v=1754056761&width=1000",
      source: "https://shopuk.iamchappellroan.com/products/pink-pony-club-7-single",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Official UK-store single" },
        { label: "Record", value: "Baby Pink 7-inch · Pink Pony Club / Naked In Manhattan" },
        { label: "Status", value: "Sold out · £11.99 listed" }
      ]
    },
    {
      id: "wishlist-chappell-good-luck-babe-red-7",
      title: "Chappell Roan — Good Luck, Babe!",
      artist: "Chappell Roan",
      edition: "Limited Red Vinyl 7-inch · demo B-side",
      priceText: "Sold out · wanted",
      price: 0,
      rank: 3,
      wishlist: true,
      description: "Official UK-store exclusive on opaque red vinyl, backed with Read & Make Out (Demo). The listing is sold out at the moment.",
      image: "https://shopuk.iamchappellroan.com/cdn/shop/files/Image20240405174004.png?v=1754056993&width=1000",
      imageSource: "https://shopuk.iamchappellroan.com/cdn/shop/files/Image20240405174004.png?v=1754056993&width=1000",
      source: "https://shopuk.iamchappellroan.com/products/good-luck-babe-limited-red-vinyl-7-single",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Limited UK-store exclusive" },
        { label: "Record", value: "Opaque Red 7-inch · original / demo" },
        { label: "Status", value: "Sold out · £11.99 listed" }
      ]
    },
    {
      id: "wishlist-chappell-subway-giver-rsd25-7",
      title: "Chappell Roan — The Subway / The Giver",
      artist: "Chappell Roan",
      edition: "RSD Black Friday 2025 · Lavender Dream 7-inch",
      priceText: "£14.99 · in stock",
      price: 0,
      rank: 4,
      wishlist: true,
      description: "Official UK-store listing for the Record Store Day Black Friday 2025 7-inch on Lavender Dream vinyl, bringing together two songs first performed live.",
      image: "https://shopuk.iamchappellroan.com/cdn/shop/files/ChappellRoanSubwayTheGiver.png?v=1780418533&width=640",
      imageSource: "https://shopuk.iamchappellroan.com/cdn/shop/files/ChappellRoanSubwayTheGiver.png?v=1780418533&width=640",
      source: "https://shopuk.iamchappellroan.com/products/the-subway-the-giver-rsd25-7",
      category: "Wishlist",
      facts: [
        { label: "Edition", value: "Record Store Day Black Friday 2025 exclusive" },
        { label: "Record", value: "7-inch · Lavender Dream vinyl" },
        { label: "Status", value: "£14.99 · in stock · checked 10 October 2026" }
      ]
    }
  ];

  wishlistRecords = wishlistRecords
    .filter((record) => record.id !== "wishlist-ariana-santa-tell-me-7")
    .filter((record) => record.id !== "wishlist-sabrina-short-n-sweet-standard-lp")
    .filter((record) => record.artist !== "Chappell Roan");

  wishlistRecords.push({
    id: "wishlist-ashe-stop-the-wedding-7",
    title: "Ashe — Stop The Wedding!",
    artist: "Ashe",
    edition: "Limited-edition 7-inch · Stop The Wedding! / Funeral",
    priceText: "Sold out · last US $21.98",
    price: 0,
    rank: 3,
    wishlist: true,
    limitedEdition: true,
    outOfStock: true,
    description: "Official-store limited seven-inch pairing Stop The Wedding! on side A with Funeral on side B. The US store currently shows the release sold out; UK shipping and import costs cannot be calculated while checkout is closed.",
    image: "https://store.ashe-music.com/cdn/shop/files/AsheStoptheWeddingFront_1.png?v=1785791628&width=1445",
    imageSource: "https://store.ashe-music.com/cdn/shop/files/AsheStoptheWeddingFront_1.png?v=1785791628&width=1445",
    gallery: [
      "https://store.ashe-music.com/cdn/shop/files/AsheStoptheWeddingFront_1.png?v=1785791628&width=1445",
      "https://store.ashe-music.com/cdn/shop/files/AsheFuneralBack_1.png?v=1785791628&width=1445"
    ],
    source: "https://store.ashe-music.com/products/stop-the-wedding-limited-edition-7-vinyl",
    category: "Wishlist",
    facts: [
      { label: "Edition", value: "Official-store limited edition" },
      { label: "Record", value: "7-inch single" },
      { label: "Tracklist", value: "Side A: Stop The Wedding! · Side B: Funeral" },
      { label: "Last price", value: "US $21.98 · shipping/import not confirmed" },
      { label: "Status", value: "Sold out · checked 19 October 2026" }
    ]
  });

  const weCantBeFriends = wishlistRecords.find((record) => record.id === "wishlist-ariana-wcbf-7");
  if (weCantBeFriends) {
    Object.assign(weCantBeFriends, {
      priceText: "Sold out · US $13.99",
      outOfStock: true
    });
    weCantBeFriends.facts = weCantBeFriends.facts.map((fact) => fact.label === "Status"
      ? { ...fact, value: "Sold out · official US store · checked 18 October 2026" }
      : fact);
  }

  const marketOverrides = {
    "wishlist-ariana-k-bye-for-now": {
      availability: "Sold out",
      listing: "Retailer + resale watch",
      seller: "No reputable copy within target",
      condition: "—",
      itemPrice: null,
      shipping: "—",
      deliveredTotal: null,
      lastChecked: "18 October 2026",
      movement: "No change",
      targetPrice: 400,
      risk: "Extremely scarce. Avoid zero-feedback sellers and never pay off-platform.",
      marketUrl: "https://www.discogs.com/sell/release/19103635",
      catalogueNumber: "0602435220321",
      discogsId: "19103635",
      history: [
        { date: "3 Oct", value: "£400", note: "Reputable copy sold before purchase" },
        { date: "18 Oct", value: "No match", note: "No reputable listing at or below £400" }
      ]
    },
    "wishlist-sabrina-espresso-liquid-filled-lp": {
      availability: "Resale available",
      listing: "eBay UK",
      seller: "saintan-9 · 100% positive (373)",
      condition: "New · sealed · Mint/Mint",
      itemPrice: 36.75,
      shipping: "£2.94 UK delivery",
      deliveredTotal: 39.69,
      lastChecked: "18 October 2026",
      movement: "£6.91 cheaper than previous best delivered total",
      targetPrice: 45,
      risk: "Private seller and no returns. Strong feedback and eBay Money Back Guarantee, but inspect the seal and liquid chamber on arrival.",
      marketUrl: "https://www.ebay.co.uk/itm/158225710138",
      history: [
        { date: "16 Oct", value: "£40.66", note: "Lowest verified listing" },
        { date: "18 Oct", value: "£39.69", note: "£36.75 + £2.94 UK delivery" }
      ]
    },
    "wishlist-sienna-material-lover-7": {
      availability: "Resale available",
      listing: "eBay UK",
      seller: "big_yellow_cranes · 99% positive (857)",
      condition: "New · sealed",
      itemPrice: 29.68,
      shipping: "£2.70 UK delivery",
      deliveredTotal: 32.38,
      lastChecked: "18 October 2026",
      movement: "Official stock sold out · new resale listing",
      risk: "Private seller, one product photo and no returns. eBay Money Back Guarantee applies; confirm the seal and exact red pressing.",
      marketUrl: "https://www.ebay.co.uk/itm/168799252283",
      history: [
        { date: "12 Oct", value: "£14.99", note: "In stock" },
        { date: "17 Oct", value: "Sold out", note: "Official UK store" },
        { date: "18 Oct", value: "£32.38", note: "New resale listing delivered" }
      ]
    },
    "wishlist-ariana-wcbf-7": {
      availability: "Sold out",
      listing: "Ariana Grande official US store",
      seller: "Official artist store",
      condition: "—",
      itemPrice: 13.99,
      shipping: "Unavailable while sold out",
      deliveredTotal: null,
      lastChecked: "18 October 2026",
      movement: "Sold out",
      risk: "Official-store page; no seller-risk warning.",
      history: [{ date: "18 Oct", value: "Sold out", note: "Official US store · last price US $13.99" }]
    },
    "wishlist-sienna-visitor-deluxe-yellow-lp": {
      availability: "Pre-order open",
      listing: "Sienna Spiro official UK store",
      seller: "Official artist store",
      condition: "New · pre-order",
      itemPrice: 25.99,
      shipping: "Calculated at checkout",
      deliveredTotal: null,
      lastChecked: "18 October 2026",
      movement: "No change",
      risk: "Official-store pre-order; no seller-risk warning.",
      history: [{ date: "15 Oct", value: "£25.99", note: "Pre-order opened" }]
    },
    "wishlist-sienna-visitor-deluxe-picture-disc": {
      availability: "Pre-order open",
      listing: "Sienna Spiro official UK store",
      seller: "Official artist store",
      condition: "New · pre-order",
      itemPrice: 27.99,
      shipping: "Calculated at checkout",
      deliveredTotal: null,
      lastChecked: "18 October 2026",
      movement: "No change",
      risk: "Official-store pre-order; no seller-risk warning.",
      history: [{ date: "15 Oct", value: "£27.99", note: "Pre-order opened" }]
    },
    "wishlist-ashe-stop-the-wedding-7": {
      availability: "Sold out",
      listing: "Ashe official US store",
      seller: "Official artist store",
      condition: "—",
      itemPrice: null,
      shipping: "Unavailable while sold out · UK import total not confirmed",
      deliveredTotal: null,
      lastChecked: "19 October 2026",
      movement: "Added to wishlist",
      targetPrice: null,
      risk: "Official-store page; no seller-risk warning. Do not confuse it with unrelated Ash band releases.",
      marketUrl: "https://store.ashe-music.com/products/stop-the-wedding-limited-edition-7-vinyl",
      ukListing: false,
      history: [{ date: "19 Oct", value: "Sold out", note: "Official US store · last price US $21.98" }]
    }
  };

  function hostnameFor(value) {
    try { return new URL(value).hostname.replace(/^www\./, ""); } catch (_) { return ""; }
  }

  function retailerName(record) {
    const host = hostnameFor(record.source);
    if (!host) return "Release watch";
    if (host.includes("arianagrande")) return "Ariana Grande official store";
    if (host.includes("sabrinacarpenter")) return "Sabrina Carpenter official store";
    if (host.includes("officialsiennaspiro")) return "Sienna Spiro official store";
    if (host.includes("bad-world")) return "Bad World";
    if (host.includes("hmv")) return "HMV";
    if (host.includes("discogs")) return "Discogs";
    return host;
  }

  function listingPrice(record) {
    const gbp = record.priceText.match(/£([0-9]+(?:\.[0-9]{1,2})?)/);
    return gbp ? Number(gbp[1]) : null;
  }

  function availabilityFor(record) {
    const status = `${record.priceText} ${record.facts.map((fact) => fact.value).join(" ")}`.toLowerCase();
    if (record.outOfStock || /sold out|vault closed/.test(status)) return "Sold out";
    if (/pre-order open/.test(status)) return "Pre-order open";
    if (/in stock/.test(status)) return "In stock";
    return "Release watch";
  }

  function dateFor(record) {
    const status = record.facts.map((fact) => `${fact.label} ${fact.value}`).join(" ");
    const match = status.match(/(?:checked\s*)?(\d{1,2}\s+[A-Z][a-z]+\s+2026)/);
    return match ? match[1] : "Awaiting live check";
  }

  function discogsIdFor(record) {
    const match = (record.source || "").match(/discogs\.com\/release\/(\d+)/i);
    return match ? match[1] : null;
  }

  function deriveMarket(record) {
    const availability = availabilityFor(record);
    const itemPrice = listingPrice(record);
    const host = hostnameFor(record.source);
    const ukListing = /(^|\.)co\.uk$/.test(host) || host.startsWith("shopuk.") || host.includes("hmv.com");
    const base = {
      availability,
      listing: retailerName(record),
      seller: /official|hmv|bad-world/.test(retailerName(record).toLowerCase()) ? "Retailer / official store" : "Seller details not verified",
      condition: availability === "Sold out" ? "—" : "New",
      itemPrice,
      shipping: availability === "Sold out" ? "—" : ukListing ? "Calculated at checkout" : "UK shipping/import unverified",
      deliveredTotal: null,
      lastChecked: dateFor(record),
      movement: "No recorded movement",
      targetPrice: null,
      risk: /official|hmv|bad-world/.test(retailerName(record).toLowerCase())
        ? "Retailer listing; check the final delivered total before ordering."
        : "Verify seller feedback, exact pressing photos and buyer protection before paying.",
      marketUrl: record.source,
      catalogueNumber: null,
      discogsId: discogsIdFor(record),
      ukListing,
      history: [{ date: "Snapshot", value: record.priceText, note: availability }]
    };
    return Object.assign(base, marketOverrides[record.id] || {}, { ukListing: (marketOverrides[record.id] || {}).ukListing ?? ukListing });
  }

  wishlistRecords.forEach((record) => {
    record.market = deriveMarket(record);
    record.gallery = Array.from(new Set([record.image, ...(record.gallery || [])].filter(Boolean)));
  });

  const wishlistActivity = [
    { date: "19 Oct", status: "Added · sold out", title: "Ashe — Stop The Wedding! 7-inch", detail: "Official US-store release at $21.98; side B is Funeral. UK delivered cost is unavailable while sold out." },
    { date: "18 Oct", status: "Still sold out", title: "Ariana Grande — k bye for now (swt live)", detail: "No reputable listing found at or below the £400 target." },
    { date: "18 Oct", status: "Cheaper listing", title: "Sabrina Carpenter — Espresso", detail: "£36.75 + £2.94 UK delivery on eBay; new, sealed, Mint/Mint." },
    { date: "18 Oct", status: "Resale found", title: "Sienna Spiro — Material Lover 7-inch", detail: "Official stock is sold out; a sealed UK resale copy is £32.38 delivered." },
    { date: "18 Oct", status: "Sold out", title: "Ariana Grande — we can’t be friends 7-inch", detail: "Official US-store stock is now unavailable; last price US $13.99." },
    { date: "15 Oct", status: "Pre-order", title: "Sienna Spiro — Visitor (Deluxe Unplugged)", detail: "Yellow vinyl £25.99 and picture disc £27.99 remain open." }
  ];

  const shortNSweetCollectors = wishlistRecords.find((record) => record.id === "wishlist-sabrina-short-n-sweet-anniversary-lp");
  if (shortNSweetCollectors) shortNSweetCollectors.rank = 2;

  const setupItems = [
    {
      id: "setup-at-lp70xbt",
      title: "Audio-Technica AT-LP70XBT",
      artist: "Dream setup",
      edition: "Black/Bronze · fully automatic Bluetooth turntable",
      priceText: "£219.00 · check stock",
      price: 219,
      setup: true,
      description: "The centrepiece of the planned system: Audio-Technica’s fully automatic belt-drive AT-LP70XBT in the exact Black/Bronze finish. It plays 33⅓ and 45 RPM records, includes Bluetooth with aptX Adaptive, and has a switchable built-in phono preamp for an easy wired connection to the Kanto YU4 speakers.",
      image: "assets/setup-at-lp70xbt-clean.png",
      imageSource: "assets/setup-at-lp70xbt-clean.png",
      source: "https://www.audio-technica.com/en-gb/at-lp70xbt",
      category: "Dream setup",
      facts: [
        { label: "Finish", value: "Black/Bronze · online-exclusive colour" },
        { label: "Drive", value: "Fully automatic belt drive · 33⅓ / 45 RPM" },
        { label: "Connections", value: "RCA line/phono output · Bluetooth 5.2" },
        { label: "Included stylus", value: "AT-VMN95C conical stylus" },
        { label: "Placement", value: "On the Jaxon cabinet beside the desk" }
      ]
    },
    {
      id: "setup-kanto-yu4",
      title: "Kanto YU4 Powered Speakers",
      artist: "Dream setup",
      edition: "Walnut finish · active speaker pair",
      priceText: "£379.00 · in stock",
      price: 379,
      setup: true,
      description: "A compact powered stereo pair in the exact Walnut finish, chosen to complement the cabinet and Black/Bronze turntable. The YU4 combines 4-inch Kevlar drivers, 1-inch silk-dome tweeters and 70 watts RMS amplification, with Bluetooth, optical inputs, RCA and a built-in phono stage. The pair belongs on the main desk, on a separate surface from the turntable, to reduce vibration reaching the stylus.",
      image: "assets/setup-kanto-yu4.jpeg",
      imageSource: "assets/setup-kanto-yu4.jpeg",
      source: "https://www.djkit.com/products/kanto-yu4-powered-bookshelf-speakers-walnut",
      category: "Dream setup",
      facts: [
        { label: "Finish", value: "Walnut" },
        { label: "System", value: "Powered stereo pair · 70W RMS / 140W peak" },
        { label: "Drivers", value: "4-inch Kevlar woofers · 1-inch silk tweeters" },
        { label: "Connections", value: "RCA/phono · Bluetooth aptX/AAC · optical" },
        { label: "Placement", value: "On the main desk, separate from the turntable" }
      ]
    },
    {
      id: "setup-at-vmn95e",
      title: "Audio-Technica AT-VMN95E Stylus",
      artist: "Dream setup",
      edition: "Green · elliptical replacement stylus",
      priceText: "£29.99 · upgrade",
      price: 29.99,
      setup: true,
      description: "The direct elliptical-stylus upgrade for the AT-LP70XBT’s fitted VM95 cartridge body. It replaces the supplied blue conical stylus without changing or realigning the cartridge, giving the system finer groove tracing and more detail while keeping the upgrade straightforward.",
      image: "assets/setup-at-vmn95e.jpeg",
      imageSource: "assets/setup-at-vmn95e.jpeg",
      source: "https://www.audio-technica.com/en-gb/at-vmn95e",
      category: "Dream setup",
      facts: [
        { label: "Profile", value: "0.3 × 0.7 mil bonded elliptical" },
        { label: "Compatibility", value: "VM95 cartridge family · AT-LP70XBT" },
        { label: "Installation", value: "Stylus swap · no cartridge alignment required" },
        { label: "Upgrade", value: "Finer groove tracing and improved detail" }
      ]
    },
    {
      id: "setup-gfw-jaxon",
      title: "GFW Jaxon Turntable Cabinet",
      artist: "Dream setup",
      edition: "Warm Walnut · two-shelf open cabinet",
      priceText: "£55.00 · in stock",
      price: 55,
      setup: true,
      description: "The compact Warm Walnut stand planned for the space beside the desk. Its 45 × 40 cm top accommodates the AT-LP70XBT’s 40 × 33 cm footprint, leaving about 2.5 cm at each side and 7 cm of depth. The open shelves keep records and accessories together while the separate speaker placement helps isolate the turntable from bass vibration.",
      image: "assets/setup-gfw-jaxon-clean.jpeg",
      imageSource: "assets/setup-gfw-jaxon-clean.jpeg",
      source: "https://www.homebase.co.uk/en-uk/gfw-jaxon-warm-walnut-2-shelf-open-turn-table-cabinet/p/0759923",
      category: "Dream setup",
      facts: [
        { label: "Finish", value: "Warm Walnut" },
        { label: "Dimensions", value: "80 × 45 × 40 cm · H × W × D" },
        { label: "Turntable fit", value: "40 × 33 cm deck on a 45 × 40 cm top" },
        { label: "Storage", value: "Two open shelves · record and accessory space" },
        { label: "Placement", value: "Beside the desk" }
      ]
    }
  ];

  const artistNames = Array.from(new Set(allRecords.map((record) => record.artist)));
  const artistGroups = artistNames.map((name) => {
    const records = allRecords.filter((record) => record.artist === name);
    return {
      name,
      records,
      total: records.reduce((sum, record) => sum + record.price, 0)
    };
  }).sort((a, b) => b.records.length - a.records.length || a.name.localeCompare(b.name, "en-GB"));
  artistGroups.forEach((group, index) => { group.index = index; });

  const wishlistArtistNames = Array.from(new Set(wishlistRecords.map((record) => record.artist)));
  const wishlistGroups = wishlistArtistNames.map((name) => ({
    name,
    records: wishlistRecords.filter((record) => record.artist === name)
  })).sort((a, b) => b.records.length - a.records.length || a.name.localeCompare(b.name, "en-GB"));
  const setupGroups = [{
    name: "Dream listening setup",
    records: setupItems,
    total: setupItems.reduce((sum, item) => sum + item.price, 0)
  }];
  const setupTotal = setupGroups[0].total;
  const grandTotal = allRecords.reduce((sum, record) => sum + record.price, 0);
  const recordSearchText = (record) => `${record.edition || ""} ${record.description || ""} ${record.facts.map((fact) => `${fact.label} ${fact.value}`).join(" ")}`.toLowerCase();
  const collectorStats = {
    variants: allRecords.filter((record) => /colour|color|splatter|marble|clear|opaque|picture disc|liquid|zoetrope|glow|tangerine|orange|pink|green|blue|red|cream|opal/.test(recordSearchText(record))).length,
    exclusives: allRecords.filter((record) => /exclusive|limited|collector|numbered|record store day|\brsd\b/.test(recordSearchText(record))).length,
    sevenInch: allRecords.filter((record) => /7[”\"]|7-inch|7 inch/.test(recordSearchText(record))).length,
    rsd: allRecords.filter((record) => /record store day|\brsd\b/.test(recordSearchText(record))).length
  };
  const crownJewels = allRecords
    .filter((record) => record.extremelyRare || record.rare || /tour exclusive|record store day|\brsd\b|collector/.test(recordSearchText(record)))
    .sort((a, b) => Number(Boolean(b.extremelyRare)) - Number(Boolean(a.extremelyRare)) || b.price - a.price)
    .slice(0, 6);
  const signedCount = allRecords.filter((record) => {
    const text = `${record.edition} ${record.description} ${record.facts.map((fact) => fact.value).join(" ")}`;
    if (/unsigned|not signed|no signed insert|no signature|no dedication/i.test(text)) return false;
    return /\bsigned\b|autograph|dedicated|dedication/i.test(text);
  }).length;
  const rareCount = allRecords.filter((record) => record.rare || record.extremelyRare).length;
  const collectionAndWatches = allRecords.concat(wishlistRecords);
  function familyDescriptor(record) {
    const name = displayTitle(record);
    const text = (name + " " + record.edition).toLowerCase();
    const artist = record.artist;
    if (artist === "Wicked" || /^wicked:/i.test(record.title)) return { artist: "Wicked", title: "The Wicked Collection" };
    if (artist === "Olivia Dean") return { artist, title: "Olivia Dean · Complete Collection" };
    if (artist === "Ariana Grande") {
      if (/dandelion/.test(text) && !/petal/.test(record.title.toLowerCase())) return { artist, title: "Eternal Sunshine · Brighter Days Ahead" };
      if (/positions|34\\+35/.test(text)) return { artist, title: "Positions" };
      if (/thank u, next|7 rings|break up with your girlfriend/.test(text)) return { artist, title: "thank u, next" };
      if (/my everything|problem|break free|love me harder|one last time/.test(text)) return { artist, title: "My Everything" };
      if (/sweetener|no tears left to cry|god is a woman|breathin/.test(text)) return { artist, title: "Sweetener" };
      if (/dangerous woman|into you|side to side/.test(text)) return { artist, title: "Dangerous Woman" };
      if (/yours truly|honeymoon avenue|the way/.test(text)) return { artist, title: "Yours Truly" };
      if (/eternal sunshine|brighter days ahead|hampstead|yes, and\\?|we can.t be friends|supernatural|the boy is mine|twilight zone/.test(text)) return { artist, title: "Eternal Sunshine · Brighter Days Ahead" };
      if (/christmas & chill|santa tell me/.test(text)) return { artist, title: "Christmas & Chill" };
      if (/petal|hate that i made you love me/.test(text)) return { artist, title: "Petal" };
      if (/k bye for now/.test(text)) return { artist, title: "Sweetener World Tour" };
    }
    if (artist === "Sabrina Carpenter") {
      if (/manchild|tears|house tour|man's best friend|mans best friend/.test(text)) return { artist, title: "Man's Best Friend" };
      if (/espresso|please please please|taste|bed chem|short n. sweet/.test(text)) return { artist, title: "Short n' Sweet" };
      if (/nonsense|feather|emails i can.t send/.test(text)) return { artist, title: "emails i can't send" };
      if (/fruitcake|a nonsense christmas/.test(text)) return { artist, title: "fruitcake" };
    }
    if (artist === "Sienna Spiro" && /visitor/.test(text)) return { artist, title: "The Visitor" };
    return { artist, title: name };
  }

  function discDescriptor(record) {
    const text = `${displayTitle(record)} ${record.edition}`.toLowerCase();
    let base = "#171412", accent = "#aa7c58", accent2 = "#e7d6c8", pattern = "solid";
    if (/manchild.*(clear|transparent)|(clear|transparent).*manchild/.test(text)) [base, accent, accent2, pattern] = ["#f0f3f0", "#c5d4d0", "#ffffff", "clear"];
    else if (/pepper yellow/.test(text)) [base, accent, accent2, pattern] = ["#eddb6e", "#f4ecad", "#c8a638", "solid"];
    else if (/black (7-inch|vinyl|lp)|standard black/.test(text)) [base, accent, accent2, pattern] = ["#1a181b", "#3b333a", "#686269", "solid"];
    else if (/pink & orange (swirl|burst)/.test(text)) [base, accent, accent2, pattern] = ["#ef9bb2", "#ef7e51", "#ffd6a8", "burst"];
    else if (/glow.in.the.dark/.test(text)) [base, accent, accent2, pattern] = ["#dce5c7", "#9fb879", "#f3f8df", "glow"];
    else if (/coke bottle/.test(text)) [base, accent, accent2, pattern] = ["#bddcc7", "#559976", "#eaf6ee", "clear"];
    else if (/purple in clear/.test(text)) [base, accent, accent2, pattern] = ["#e4dcf0", "#8d48b5", "#c878d8", "clear"];
    else if (/pink & cream/.test(text)) [base, accent, accent2, pattern] = ["#efb9cc", "#f5e6cf", "#d677a0", "marble"];
    else if (/baby pink black wave/.test(text)) [base, accent, accent2, pattern] = ["#e7aabd", "#242024", "#f3d5df", "wave"];
    else if (/milky black marble/.test(text)) [base, accent, accent2, pattern] = ["#d8d3d0", "#29262a", "#8b8487", "marble"];
    else if (/pink & orange burst/.test(text)) [base, accent, accent2, pattern] = ["#ef9bb2", "#ef7e51", "#ffd6a8", "burst"];
    else if (/pink & clear marble/.test(text)) [base, accent, accent2, pattern] = ["#f0c5d6", "#ffffff", "#bb6992", "marble"];
    else if (/pink & mint green splatter/.test(text)) [base, accent, accent2, pattern] = ["#eaa2bd", "#80c8b1", "#f4d8e2", "splatter"];
    else if (/opaque blue marble/.test(text)) [base, accent, accent2, pattern] = ["#6e91bd", "#bad7e9", "#315a84", "marble"];
    else if (/sunset orange|orange vinyl/.test(text)) [base, accent, accent2, pattern] = ["#e5733f", "#ffad69", "#7d3724", "marble"];
    else if (/tangerine/.test(text)) [base, accent, accent2, pattern] = ["#e26937", "#ffb05c", "#983b25", "solid"];
    else if (/red vinyl/.test(text)) [base, accent, accent2, pattern] = ["#a82e36", "#e66063", "#5a121c", "solid"];
    else if (/pink champagne|liquid/.test(text)) [base, accent, accent2, pattern] = ["#f5ccd8", "#e891ab", "#fff2f4", "liquid"];
    else if (/flower-filled|bad world/.test(text)) [base, accent, accent2, pattern] = ["#ece5dc", "#cb7697", "#7ca67d", "flowers"];
    else if (/opal/.test(text)) [base, accent, accent2, pattern] = ["#e7e1f2", "#8dd6cc", "#d798de", "opal"];
    else if (/cloudy gray|cloudy grey/.test(text)) [base, accent, accent2, pattern] = ["#aaa9ad", "#e3e1e6", "#77777d", "marble"];
    else if (/dandelion white/.test(text)) [base, accent, accent2, pattern] = ["#f1eee5", "#d8bd5d", "#fffdf4", "clear"];
    else if (/snowflake|etched clear/.test(text)) [base, accent, accent2, pattern] = ["#e9f1f3", "#ffffff", "#9ec6d0", "snow"];
    else if (/fuchsia|purple & green|green & purple/.test(text)) [base, accent, accent2, pattern] = ["#d53b9a", "#52a75f", "#f0a4d1", "marble"];
    else if (/green/.test(text)) [base, accent, accent2, pattern] = ["#52956a", "#9ac384", "#285a45", "marble"];
    else if (/pink/.test(text)) [base, accent, accent2, pattern] = ["#e99bb8", "#f7cedb", "#a95d82", "marble"];
    else if (/blue/.test(text)) [base, accent, accent2, pattern] = ["#4979ad", "#9ec8e5", "#264d77", "marble"];
    else if (/glow/.test(text)) [base, accent, accent2, pattern] = ["#dce5c7", "#9fb879", "#f3f8df", "glow"];
    return { base, accent, accent2, pattern, label: displayTitle(record).slice(0, 2).toUpperCase() };
  }

  function discMarkup(record, className = "pressing-disc") {
    // Never manufacture a disc or centre label. Only display a separately
    // verified photograph of this exact pressing, when one is available.
    const image = record.discImage;
    if (!image || !/^assets\/[a-z0-9_./-]+\.(?:png|webp|jpe?g)$/i.test(image)) {
      return '<span class="pressing-disc-unverified" aria-hidden="true"></span>';
    }
    return `<img class="${escapeAttr(className)} pressing-disc--photographed" src="${escapeAttr(image)}" alt="" loading="lazy">`;
  }

  const albumFamilies = Array.from(new Map(collectionAndWatches.map((record) => {
    const descriptor = familyDescriptor(record);
    return [`${descriptor.artist}::${descriptor.title}`, { key: `${descriptor.artist}::${descriptor.title}`, artist: descriptor.artist, title: descriptor.title, records: [] }];
  })).values());
  albumFamilies.forEach((family) => {
    family.records = collectionAndWatches.filter((record) => {
      const descriptor = familyDescriptor(record);
      return descriptor.artist === family.artist && descriptor.title === family.title;
    });
    family.owned = family.records.filter((record) => !record.wishlist).length;
    family.wanted = family.records.filter((record) => record.wishlist).length;
  });
  const arianaOwned = allRecords.filter((record) => record.artist === "Ariana Grande");
  const arianaWatched = wishlistRecords.filter((record) => record.artist === "Ariana Grande");
  const trackedAriana = arianaOwned.concat(arianaWatched);
  const latestAddition = allRecords.find((record) => record.title === "Jamie Miller — Baby Doll") || allRecords.find((record) => record.journal);
  const nowSpinningKey = "jay-vinyl-now-spinning";
  const nowSpinningDismissedKey = "jay-vinyl-now-spinning-dismissed";
  const setupProgressKey = "jay-vinyl-setup-progress";
  let setupProgress = {};
  try { setupProgress = JSON.parse(localStorage.getItem(setupProgressKey) || "{}"); } catch (_) {}
  let nowSpinningId = "";
  let nowSpinningDismissed = false;
  let darkRoom = false;
  let previewAudio = null;
  let previewRecordId = "";
  let previewState = "idle";
  try {
    nowSpinningId = localStorage.getItem(nowSpinningKey) || "";
    darkRoom = localStorage.getItem("jay-vinyl-dark-room") === "true";
    nowSpinningDismissed = sessionStorage.getItem(nowSpinningDismissedKey) === "true";
  } catch (_) {}
  const totalPinHash = "f16592d12000ffca0f1159286959f4c2470c82a7b48940020b1323a6d49abe27";
  const totalSessionKey = "jay-vinyl-total-unlocked";
  const state = {
    page: "home",
    view: "collection",
    artist: "All",
    query: "",
    sort: "asc",
    layout: "gallery",
    collectionMode: "gallery",
    setupMode: "dream",
    connection: "wired",
    wishlistFilter: "all",
    formatFilter: "all",
    activeId: null
  };
  let lastFocus = null;
  let totalLastFocus = null;
  let totalUnlocked = false;
  try {
    totalUnlocked = sessionStorage.getItem(totalSessionKey) === "true";
  } catch (_) {
    totalUnlocked = false;
  }

  document.title = "Jay’s Vinyl Collection";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#f4f5f2");

  document.body.innerHTML = `
    <div class="archive-app${darkRoom ? " is-room" : ""}">
      <header class="archive-header">
        <div class="archive-shell archive-nav">
          <div class="archive-wordmark">
            <span class="archive-owner">Jay Jones</span>
            <strong class="archive-site-title">Record collection</strong>
          </div>
          <div class="archive-nav-summary" aria-label="Collection summary">
            <span><strong>${allRecords.length}</strong> records</span>
            <span><strong>${artistGroups.length}</strong> artists</span>
            <span class="total-lock-slot">
              <button class="total-lock-trigger" type="button" data-total-trigger aria-haspopup="dialog" aria-controls="total-pin-dialog">
                <strong>£••••.••</strong>
                <small>Enter PIN to reveal</small>
              </button>
              <span class="total-lock-revealed" data-total-revealed hidden>
                <strong data-total-value></strong>
                <small>spent</small>
                <button class="total-hide-button" type="button" data-total-hide>Hide again</button>
              </span>
            </span>
            <button class="room-mode-toggle" type="button" data-theme-toggle aria-pressed="${darkRoom}" aria-label="${darkRoom ? "Switch to day mode" : "Switch to night mode"}">${darkRoom ? "☼" : "◐"}<span>${darkRoom ? "Day mode" : "Night mode"}</span></button>
          </div>
        </div>
      </header>

      <section class="archive-hero">
        <div class="archive-shell archive-hero-grid">
          <div class="archive-hero-copy">
            <span class="archive-hero-kicker">Private pressing archive · Stafford</span>
            <h1>The Listening<br><em>Archive.</em></h1>
            <p>A living catalogue of every exact pressing, the collection notes that make them personal, the impossible finds still being hunted, and the system they’ll eventually be played on.</p>
            <div class="archive-hero-actions">
              <button type="button" class="hero-primary" data-scroll-collection>Explore the collection</button>
              <button type="button" class="hero-secondary" data-surprise>Surprise me <span>↗</span></button>
            </div>
            <dl class="archive-hero-stats">
              <div><dt>Pressings</dt><dd>${allRecords.length}</dd></div>
              <div><dt>Variants</dt><dd>${collectorStats.variants}</dd></div>
              <div><dt>Exclusives</dt><dd>${collectorStats.exclusives}</dd></div>
              <div><dt>Artists</dt><dd>${artistGroups.length}</dd></div>
            </dl>
          </div>
          <div class="archive-hero-object" aria-hidden="true">
            <span class="hero-disc hero-disc--back"></span>
            <span class="hero-disc hero-disc--front"></span>
            <span class="hero-sleeve"><span>JAY’S<br>VINYL<br>ARCHIVE</span><small>EST. 2026</small></span>
            <span class="hero-orbit">CURATED · COLLECTED · PLAYED ·</span>
          </div>
        </div>
      </section>

      <main class="archive-shell archive-home-vault" aria-label="Collection vault">
        ${collectionDashboard()}
      </main>

      <div class="archive-page-topbar" hidden>
        <div class="archive-shell archive-page-topbar-inner">
          <button type="button" class="archive-back-button" data-page-back>← <span>Back to Listening Archive</span></button>
          <div class="archive-page-heading"><small>JAY JONES · VINYL ARCHIVE</small><strong data-page-title>Collection</strong></div>
          <div class="archive-page-meta">
            <span class="archive-page-count" data-page-count></span>
            <button class="page-total-lock" type="button" data-total-trigger aria-haspopup="dialog" aria-controls="total-pin-dialog"><strong>£••••.••</strong><small>PIN</small></button>
            <span class="page-total-revealed" data-total-revealed hidden><strong data-total-value></strong><button type="button" data-total-hide>Hide</button></span>
          </div>
        </div>
      </div>

      <div class="archive-view-nav-wrap">
        <nav class="archive-shell archive-view-nav" aria-label="Archive sections">
          <button type="button" class="view-nav-button" data-view-button="collection" aria-current="page">
            <span class="view-nav-number">01</span><span><strong>Collection</strong><small>${allRecords.length} owned pressings</small></span>
          </button>
          <button type="button" class="view-nav-button" data-view-button="wishlist">
            <span class="view-nav-number">02</span><span><strong>Wishlist</strong><small>${wishlistRecords.length} release watches</small></span>
          </button>
          <button type="button" class="view-nav-button" data-view-button="setup">
            <span class="view-nav-number">03</span><span><strong>Listening room</strong><small>${setupItems.length} planned pieces</small></span>
          </button>
        </nav>
      </div>

      <div class="archive-controls-wrap">
        <div class="archive-shell archive-controls">
          <nav class="archive-tabs" aria-label="Filter collection by artist"></nav>
          <div class="archive-tools">
            <label>
              <span class="sr-only" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">Search records</span>
              <input class="archive-search" type="search" placeholder="Search the archive" autocomplete="off">
            </label>
            <label>
              <span class="sr-only" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">Sort records</span>
              <select class="archive-sort">
                <option value="asc">Price: low first</option>
                <option value="desc">Price: high first</option>
                <option value="title">Title: A–Z</option>
              </select>
            </label>
            <div class="layout-switch" role="group" aria-label="Collection layout">
              <button type="button" data-layout="gallery" aria-pressed="true" title="Gallery view">▦<span>Gallery</span></button>
              <button type="button" data-layout="shelf" aria-pressed="false" title="Shelf view">▤<span>Shelf</span></button>
              <button type="button" data-layout="ledger" aria-pressed="false" title="Ledger view">☰<span>Ledger</span></button>
            </div>
          </div>
          <div class="format-filter-switch" role="group" aria-label="Filter collection by record format"></div>
        </div>
      </div>

      <main class="archive-shell archive-collection">
        <div class="collection-summary" aria-live="polite"></div>
        <div class="collection-sections"></div>
      </main>

      <footer class="archive-shell archive-footer">
        <span class="archive-footer-mark">Jay Jones · Record collection</span>
        <span class="archive-footer-total">
          ${artistGroups.length} artists · ${allRecords.length} records ·
          <span class="footer-total-masked" data-total-masked>£••••.•• spent</span>
          <span class="footer-total-revealed" data-total-revealed hidden><strong data-total-value></strong> spent</span>
        </span>
      </footer>

      <nav class="mobile-view-dock" aria-label="Archive sections">
        <button type="button" data-view-button="home"><span class="dock-icon dock-icon--home" aria-hidden="true">⌂</span><span>Home</span></button>
        <button type="button" data-view-button="collection" aria-current="page"><span class="dock-icon dock-icon--record" aria-hidden="true"></span><span>Collection</span></button>
        <button type="button" data-view-button="wishlist"><span class="dock-icon dock-icon--heart" aria-hidden="true">♡</span><span>Wishlist</span></button>
        <button type="button" data-view-button="setup"><span class="dock-icon dock-icon--room" aria-hidden="true"></span><span>Setup</span></button>
      </nav>
      <div class="now-spinning-bar" aria-label="Now spinning">
        <button class="now-spinning-main" type="button" data-now-spinning-open aria-label="Open the currently selected record">
          <span class="now-spinning-disc-slot" aria-hidden="true"></span><span><small>NOW SPINNING</small><strong data-now-spinning-title>Choose a record in the Vault</strong></span><b aria-hidden="true">↗</b>
        </button>
        <button class="now-spinning-close" type="button" data-now-spinning-close aria-label="Dismiss Now Spinning">×</button>
      </div>
    </div>

    <div class="record-loader" data-record-loader hidden aria-hidden="true">
      <span class="record-loader-disc" aria-hidden="true"><i></i></span>
      <span><small>OPENING THE ARCHIVE</small><strong data-record-loader-title>Record details</strong></span>
    </div>

    <div class="record-modal" hidden aria-hidden="true">
      <div class="modal-backdrop" data-close-modal></div>
      <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-record-title"></section>
    </div>

    <div class="total-pin-modal" hidden aria-hidden="true">
      <div class="total-pin-backdrop" data-close-total-pin></div>
      <section class="total-pin-panel" id="total-pin-dialog" role="dialog" aria-modal="true" aria-labelledby="total-pin-title">
        <button class="total-pin-close" type="button" aria-label="Close PIN entry" data-close-total-pin>×</button>
        <span class="total-pin-kicker">Private totals</span>
        <h2 id="total-pin-title">Enter PIN to reveal</h2>
        <p>Your collection total and artist subtotals are hidden for privacy.</p>
        <form class="total-pin-form" novalidate>
          <label for="total-pin-input">4-digit PIN</label>
          <input id="total-pin-input" name="pin" type="password" inputmode="numeric" autocomplete="off" maxlength="4" pattern="[0-9]{4}" aria-describedby="total-pin-error">
          <p class="total-pin-error" id="total-pin-error" aria-live="polite"></p>
          <button class="total-pin-submit" type="submit">Reveal totals</button>
        </form>
      </section>
    </div>
  `;

  const tabsNode = document.querySelector(".archive-tabs");
  const sectionsNode = document.querySelector(".collection-sections");
  const summaryNode = document.querySelector(".collection-summary");
  const searchNode = document.querySelector(".archive-search");
  const sortNode = document.querySelector(".archive-sort");
  const controlsWrap = document.querySelector(".archive-controls-wrap");
  const formatFilterNode = document.querySelector(".format-filter-switch");
  const modalNode = document.querySelector(".record-modal");
  const modalPanel = document.querySelector(".modal-panel");
  const totalPinModal = document.querySelector(".total-pin-modal");
  const totalPinPanel = document.querySelector(".total-pin-panel");
  const totalPinForm = document.querySelector(".total-pin-form");
  const totalPinInput = document.querySelector("#total-pin-input");
  const totalPinError = document.querySelector(".total-pin-error");
  const recordLoader = document.querySelector("[data-record-loader]");

  function updateTotalPrivacy() {
    document.querySelectorAll("[data-total-trigger]").forEach((button) => { button.hidden = totalUnlocked; });
    document.querySelectorAll("[data-total-masked]").forEach((node) => { node.hidden = totalUnlocked; });
    document.querySelectorAll("[data-total-revealed]").forEach((node) => { node.hidden = !totalUnlocked; });
    document.querySelectorAll("[data-total-value]").forEach((node) => {
      node.textContent = totalUnlocked ? money(grandTotal) : "";
    });
    document.querySelectorAll("[data-private-price]").forEach((node) => {
      const maskedValue = node.dataset.privateMask || "£••.••";
      node.textContent = totalUnlocked ? node.dataset.privateValue : maskedValue;
      node.classList.toggle("is-masked", !totalUnlocked);
      node.setAttribute("aria-label", totalUnlocked ? node.dataset.privateValue : "Price hidden");
    });
  }

  function privatePriceMarkup(value, className, maskedValue = "£••.••") {
    const shownValue = totalUnlocked ? value : maskedValue;
    return `<span class="${escapeAttr(className)} private-price${totalUnlocked ? "" : " is-masked"}" data-private-price data-private-value="${escapeAttr(value)}" data-private-mask="${escapeAttr(maskedValue)}" aria-label="${totalUnlocked ? escapeAttr(value) : "Price hidden"}">${escapeHTML(shownValue)}</span>`;
  }

  function openTotalPin() {
    totalLastFocus = document.activeElement;
    totalPinInput.value = "";
    totalPinError.textContent = "";
    totalPinInput.removeAttribute("aria-invalid");
    totalPinModal.hidden = false;
    totalPinModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => totalPinInput.focus({ preventScroll: true }));
  }

  function closeTotalPin() {
    totalPinModal.hidden = true;
    totalPinModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (totalLastFocus && typeof totalLastFocus.focus === "function") totalLastFocus.focus({ preventScroll: true });
  }

  async function hashPin(value) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function hideTotal() {
    totalUnlocked = false;
    try { sessionStorage.removeItem(totalSessionKey); } catch (_) {}
    updateTotalPrivacy();
    document.querySelector("[data-total-trigger]")?.focus({ preventScroll: true });
  }

  document.querySelectorAll("[data-total-trigger]").forEach((button) => button.addEventListener("click", openTotalPin));
  document.querySelectorAll("[data-total-hide]").forEach((button) => button.addEventListener("click", hideTotal));
  totalPinModal.querySelectorAll("[data-close-total-pin]").forEach((node) => node.addEventListener("click", closeTotalPin));
  totalPinInput.addEventListener("input", () => {
    totalPinInput.value = totalPinInput.value.replace(/\D/g, "").slice(0, 4);
    totalPinError.textContent = "";
    totalPinInput.removeAttribute("aria-invalid");
  });
  totalPinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (totalPinInput.value.length !== 4) {
      totalPinError.textContent = "Enter all 4 digits.";
      totalPinInput.setAttribute("aria-invalid", "true");
      totalPinInput.focus();
      return;
    }
    const matches = await hashPin(totalPinInput.value) === totalPinHash;
    if (!matches) {
      totalPinError.textContent = "That PIN isn’t correct. Try again.";
      totalPinInput.setAttribute("aria-invalid", "true");
      totalPinInput.select();
      return;
    }
    totalUnlocked = true;
    try { sessionStorage.setItem(totalSessionKey, "true"); } catch (_) {}
    updateTotalPrivacy();
    closeTotalPin();
  });
  function trapFocus(container, event) {
    if (event.key !== "Tab") return;
    const focusable = Array.from(container.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'))
      .filter((node) => !node.hidden && node.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  totalPinPanel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTotalPin();
    trapFocus(totalPinPanel, event);
  });
  updateTotalPrivacy();

  function renderTabs() {
    const options = [{ name: "All", count: allRecords.length }].concat(
      artistGroups.map((artist) => ({ name: artist.name, count: artist.records.length }))
    );
    tabsNode.hidden = state.view !== "collection";
    tabsNode.innerHTML = options.map((option) => `
      <button class="archive-tab" type="button" data-artist="${escapeAttr(option.name)}" aria-pressed="${state.view === "collection" && state.artist === option.name}">
        ${escapeHTML(option.name)}<span class="archive-tab-count">${option.count}</span>
      </button>
    `).join("");

    tabsNode.querySelectorAll(".archive-tab").forEach((button) => {
      button.addEventListener("click", () => {
        state.artist = button.dataset.artist;
        renderTabs();
        renderCollection();
        document.querySelector(".archive-collection")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function syncSortOptions() {
    const optionSets = state.view === "wishlist"
      ? [
          ["priority", "Priority order"],
          ["available", "Available first"],
          ["price-asc", "Price: low first"],
          ["title", "Title: A–Z"]
        ]
      : [
          ["asc", "Price: low first"],
          ["desc", "Price: high first"],
          ["title", "Title: A–Z"]
        ];
    if (!optionSets.some(([value]) => value === state.sort)) state.sort = optionSets[0][0];
    sortNode.innerHTML = optionSets.map(([value, label]) => `<option value="${value}"${state.sort === value ? " selected" : ""}>${label}</option>`).join("");
  }

  function renderViewNavigation() {
    const app = document.querySelector(".archive-app");
    const isHome = state.page === "home";
    const topbar = document.querySelector(".archive-page-topbar");
    const backButton = document.querySelector("[data-page-back]");
    const pageTitle = document.querySelector("[data-page-title]");
    const pageCount = document.querySelector("[data-page-count]");
    app?.classList.toggle("is-home-page", isHome);
    app?.classList.toggle("is-subpage", !isHome);
    document.querySelector(".archive-hero")?.toggleAttribute("hidden", !isHome);
    document.querySelector(".archive-home-vault")?.toggleAttribute("hidden", !isHome);
    document.querySelector(".archive-view-nav-wrap")?.toggleAttribute("hidden", isHome);
    document.querySelector(".archive-controls-wrap")?.toggleAttribute("hidden", isHome);
    document.querySelector(".archive-collection")?.toggleAttribute("hidden", isHome);
    document.querySelector(".archive-footer")?.toggleAttribute("hidden", isHome);
    document.querySelector(".mobile-view-dock")?.toggleAttribute("hidden", isHome);
    document.querySelector(".now-spinning-bar")?.toggleAttribute("hidden", isHome || nowSpinningDismissed);
    if (topbar) topbar.hidden = isHome;
    if (pageTitle) {
      pageTitle.textContent = state.page === "format" ? formatPageTitle(state.formatFilter) : state.view === "wishlist" ? "Wishlist" : state.view === "setup" ? "Listening room" : "The collection";
    }
    if (pageCount) pageCount.textContent = state.page === "format" ? `${allRecords.filter((record) => recordFormat(record) === state.formatFilter).length} records` : state.view === "wishlist" ? `${wishlistRecords.length} watches` : state.view === "setup" ? `${setupItems.length} planned pieces` : `${allRecords.length} pressings`;
    if (backButton) {
      const fromFormat = state.page === "format";
      backButton.dataset.backTarget = fromFormat ? "collection" : "home";
      backButton.querySelector("span").textContent = fromFormat ? "Back to all pressings" : "Back to Listening Archive";
    }
    document.querySelectorAll("[data-view-button]").forEach((button) => {
      const selected = button.dataset.viewButton === "home" ? isHome : button.dataset.viewButton === state.view && !isHome;
      if (selected) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    controlsWrap.hidden = isHome || state.view === "setup";
    controlsWrap.dataset.view = state.view;
    renderFormatFilters();
    syncSortOptions();
    renderTabs();
  }

  function formatPageTitle(format) {
    return ({ lp: "LP collection", "7-inch": "7-inch collection", "box-set": "Box sets", "picture-disc": "Picture discs" })[format] || "The collection";
  }

  function routeHash(page, format = "all") {
    if (page === "home") return "";
    if (page === "format") return `#format=${encodeURIComponent(format)}`;
    return `#${page}`;
  }

  function parseRoute() {
    const hash = location.hash.replace(/^#/, "");
    const formatMatch = hash.match(/^format=(.+)$/);
    if (formatMatch) {
      const format = decodeURIComponent(formatMatch[1]);
      if (["lp", "7-inch", "box-set", "picture-disc"].includes(format)) return { page: "format", view: "collection", format };
    }
    if (hash === "collection") return { page: "collection", view: "collection", format: "all" };
    if (hash === "wishlist") return { page: "wishlist", view: "wishlist", format: "all" };
    if (hash === "setup") return { page: "setup", view: "setup", format: "all" };
    const recordMatch = hash.match(/^record=(.+)$/);
    if (recordMatch) return { page: "collection", view: "collection", format: "all", recordId: decodeURIComponent(recordMatch[1]) };
    return { page: "home", view: "collection", format: "all" };
  }

  function applyRoute(route, { shouldScroll = true } = {}) {
    state.page = route.page;
    state.view = route.view;
    state.formatFilter = route.format || "all";
    state.artist = "All";
    state.query = "";
    state.wishlistFilter = "all";
    state.sort = route.view === "wishlist" ? "priority" : "asc";
    searchNode.value = "";
    renderViewNavigation();
    renderCollection();
    if (shouldScroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigatePage(page, { replace = false, shouldScroll = true } = {}) {
    let route;
    if (page.startsWith("format:")) {
      const format = page.slice("format:".length);
      route = format === "all" ? { page: "collection", view: "collection", format: "all" } : { page: "format", view: "collection", format };
    } else if (page === "collection" || page === "wishlist" || page === "setup" || page === "home") {
      route = { page, view: page === "home" ? "collection" : page, format: "all" };
    } else return;
    const hash = routeHash(route.page, route.format);
    try {
      const url = `${location.pathname}${location.search}${hash}`;
      const historyState = { archiveRoute: route.page, format: route.format };
      if (replace) history.replaceState(historyState, "", url);
      else history.pushState(historyState, "", url);
    } catch (_) {}
    applyRoute(route, { shouldScroll });
  }

  function matchesQuery(record) {
    if (!state.query) return true;
    const searchable = [
      record.title,
      record.artist,
      record.edition,
      record.category,
      record.description,
      ...record.facts.flatMap((fact) => [fact.label, fact.value])
    ].join(" ").toLowerCase();
    return searchable.includes(state.query);
  }

  function recordFormat(record) {
    const text = `${record.title} ${record.edition} ${record.description} ${record.facts.map((fact) => fact.value).join(" ")}`.toLowerCase();
    if (/picture[ -]?disc|picture vinyl/.test(text)) return "picture-disc";
    if (/box[ -]?set|boxset/.test(text)) return "box-set";
    if (/7[”\"]|7[ -]?inch|seven inch/.test(text)) return "7-inch";
    return "lp";
  }

  function renderFormatFilters() {
    const options = [["all", "All formats"], ["lp", "LPs"], ["7-inch", "7-inches"], ["box-set", "Box sets"], ["picture-disc", "Picture discs"]];
    const counts = Object.fromEntries(options.map(([key]) => [key, key === "all" ? allRecords.length : allRecords.filter((record) => recordFormat(record) === key).length]));
    formatFilterNode.hidden = state.view !== "collection" || state.page === "home";
    formatFilterNode.innerHTML = options.map(([key, label]) => `<button type="button" data-format-filter="${key}" aria-pressed="${state.formatFilter === key}"${key !== "all" && counts[key] === 0 ? " disabled" : ""}>${label}<span>${counts[key]}</span></button>`).join("");
    formatFilterNode.querySelectorAll("[data-format-filter]").forEach((button) => button.addEventListener("click", () => {
      navigatePage(`format:${button.dataset.formatFilter}`);
    }));
  }

  function matchesFormat(record) {
    return state.view !== "collection" || state.formatFilter === "all" || recordFormat(record) === state.formatFilter;
  }

  function matchesWishlistFilter(record) {
    if (state.view !== "wishlist" || state.wishlistFilter === "all") return true;
    const availability = record.market?.availability || availabilityFor(record);
    if (state.wishlistFilter === "priority") return Boolean(record.highPriority);
    if (state.wishlistFilter === "available") return /in stock|pre-order open|resale available/i.test(availability);
    if (state.wishlistFilter === "sold-out") return /sold out/i.test(availability);
    if (state.wishlistFilter === "uk") return Boolean(record.market?.ukListing);
    return true;
  }

  function sortRecords(records) {
    if (state.view === "wishlist") return records.slice().sort((a, b) => {
      if (state.sort === "title") return a.title.localeCompare(b.title, "en-GB");
      if (state.sort === "price-asc") return (a.market?.itemPrice ?? Number.POSITIVE_INFINITY) - (b.market?.itemPrice ?? Number.POSITIVE_INFINITY) || a.rank - b.rank;
      if (state.sort === "available") {
        const availableRank = (record) => /in stock|pre-order open|resale available/i.test(record.market?.availability || "") ? 0 : 1;
        return availableRank(a) - availableRank(b) || a.rank - b.rank;
      }
      return a.rank - b.rank;
    });
    return records.slice().sort((a, b) => {
      if (state.sort === "title") return a.title.localeCompare(b.title, "en-GB");
      if (state.sort === "desc") return b.price - a.price || a.title.localeCompare(b.title, "en-GB");
      return a.price - b.price || a.title.localeCompare(b.title, "en-GB");
    });
  }

  function visibleGroups() {
    const groups = state.view === "wishlist" ? wishlistGroups : state.view === "setup" ? setupGroups : artistGroups;
    return groups
      .filter((artist) => state.artist === "All" || artist.name === state.artist)
      .map((artist) => ({
        ...artist,
        records: sortRecords(artist.records.filter(matchesQuery).filter(matchesWishlistFilter).filter(matchesFormat))
      }))
      .filter((artist) => artist.records.length);
  }

  function dealLabel(market) {
    if (!market?.targetPrice || market.deliveredTotal == null) return { label: "Watching", tone: "watch" };
    const ratio = market.deliveredTotal / market.targetPrice;
    if (ratio <= 0.9) return { label: "Great deal", tone: "great" };
    if (ratio <= 1.1) return { label: "Fair price", tone: "fair" };
    return { label: "Overpriced", tone: "high" };
  }

  function previewControlMarkup(record, context = "vault") {
    if (!record?.nowPlaying?.url) return "";
    const active = previewRecordId === record.id && previewAudio && !previewAudio.paused;
    const loading = previewRecordId === record.id && previewState === "loading";
    const label = loading ? "Loading preview…" : active ? `Pause “${record.nowPlaying.title}”` : `Play “${record.nowPlaying.title}”`;
    return `<div class="record-preview record-preview--${escapeAttr(context)}">
      <button class="preview-toggle" type="button" data-preview-toggle data-record-id="${escapeAttr(record.id)}" aria-label="${escapeAttr(label)}" aria-pressed="${active}">
        <span class="preview-icon" data-preview-icon aria-hidden="true">${loading ? "◌" : active ? "Ⅱ" : "▶"}</span>
        <span><small>Selected cut · official 30-second preview</small><strong data-preview-label>${escapeHTML(label)}</strong><em>${escapeHTML(record.nowPlaying.artist)}</em></span>
      </button>
      <span class="preview-status" data-preview-status aria-live="polite">${loading ? "Loading audio…" : active ? "Playing now" : "Tap play to hear the record"}</span>
    </div>`;
  }

  function refreshHomeDashboard() {
    if (!homeVault || state.page !== "home") return;
    homeVault.innerHTML = collectionDashboard();
    updateTotalPrivacy();
    syncPreviewUI();
  }

  function setNowSpinning(recordId, { refreshHome = true } = {}) {
    nowSpinningId = recordId || "";
    nowSpinningDismissed = false;
    try { localStorage.setItem(nowSpinningKey, nowSpinningId); } catch (_) {}
    try { sessionStorage.removeItem(nowSpinningDismissedKey); } catch (_) {}
    if (refreshHome) refreshHomeDashboard();
    updateNowSpinningBar();
  }

  function syncPreviewUI() {
    const playing = Boolean(previewAudio && !previewAudio.paused && !previewAudio.ended);
    document.querySelectorAll("[data-preview-toggle]").forEach((button) => {
      const record = allRecords.find((item) => item.id === button.dataset.recordId);
      if (!record?.nowPlaying) return;
      const isCurrent = previewRecordId === record.id;
      const isPlaying = isCurrent && playing;
      const isLoading = isCurrent && previewState === "loading";
      const label = isLoading ? "Loading preview…" : isPlaying ? `Pause “${record.nowPlaying.title}”` : `Play “${record.nowPlaying.title}”`;
      button.setAttribute("aria-label", label);
      button.setAttribute("aria-pressed", String(isPlaying));
      button.classList.toggle("is-loading", isLoading);
      button.querySelector("[data-preview-icon]").textContent = isLoading ? "◌" : isPlaying ? "Ⅱ" : "▶";
      button.querySelector("[data-preview-label]").textContent = label;
      const status = button.closest(".record-preview")?.querySelector("[data-preview-status]");
      if (status) status.textContent = isLoading ? "Loading audio…" : isPlaying ? "Playing now" : isCurrent && previewState === "paused" ? "Paused" : "Tap play to hear the record";
    });
    document.querySelectorAll(".now-deck, .now-spinning-bar").forEach((node) => node.classList.toggle("is-playing", playing));
    document.querySelectorAll(".shelf-record--has-disc.is-spinning").forEach((card) => {
      if (card.dataset.recordId !== previewRecordId || !playing) {
        card.classList.remove("is-spinning");
        card.dataset.vinylState = card.matches(":hover") ? "pulled" : "sleeved";
        card.classList.toggle("is-pulled", card.dataset.vinylState === "pulled");
      }
    });
    document.querySelectorAll("[data-preview-disc]").forEach((node) => node.classList.toggle("is-playing", playing && node.dataset.previewDisc === previewRecordId));
  }

  async function togglePreview(recordId) {
    const record = allRecords.find((item) => item.id === recordId);
    if (!record?.nowPlaying?.url) {
      showArchiveToast("No verified preview is attached to this record yet");
      return;
    }

    setNowSpinning(record.id);

    if (previewAudio && previewRecordId === record.id) {
      if (!previewAudio.paused) {
        previewAudio.pause();
        previewState = "paused";
        syncPreviewUI();
        return;
      }
      previewState = "loading";
      syncPreviewUI();
      try {
        await previewAudio.play();
      } catch (_) {
        previewState = "error";
        syncPreviewUI();
        showArchiveToast("The preview could not start. Check silent mode or tap play again.");
      }
      return;
    }

    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }
    previewRecordId = record.id;
    previewState = "loading";
    previewAudio = new Audio(record.nowPlaying.url);
    previewAudio.preload = "auto";
    previewAudio.addEventListener("playing", () => { previewState = "playing"; syncPreviewUI(); });
    previewAudio.addEventListener("pause", () => { if (!previewAudio.ended && previewState !== "loading") previewState = "paused"; syncPreviewUI(); });
    previewAudio.addEventListener("ended", () => { previewState = "idle"; syncPreviewUI(); });
    previewAudio.addEventListener("error", () => { previewState = "error"; syncPreviewUI(); showArchiveToast("This official preview is temporarily unavailable."); });
    syncPreviewUI();
    try {
      await previewAudio.play();
    } catch (_) {
      previewState = "error";
      syncPreviewUI();
      showArchiveToast("The preview could not start. Check silent mode or tap play again.");
    }
  }

  function showRecordLoader(record) {
    if (!recordLoader) return;
    recordLoader.querySelector("[data-record-loader-title]").textContent = displayTitle(record);
    recordLoader.hidden = false;
    recordLoader.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => recordLoader.classList.add("is-visible"));
    clearTimeout(showRecordLoader.timer);
    showRecordLoader.timer = setTimeout(() => {
      recordLoader.classList.remove("is-visible");
      setTimeout(() => {
        recordLoader.hidden = true;
        recordLoader.setAttribute("aria-hidden", "true");
      }, 180);
    }, 420);
  }

  function collectionDashboard() {
    const topArtists = artistGroups.slice(0, 5);
    const largest = Math.max(...topArtists.map((group) => group.records.length), 1);
    const journalRecords = allRecords.filter((record) => record.journal);
    const nowSpinningRecord = allRecords.find((record) => record.id === nowSpinningId);
    const highestPaid = allRecords.slice().sort((a, b) => b.price - a.price)[0];
    const weekOffset = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 604800000);
    const recordOfWeek = allRecords.length ? allRecords[(weekOffset % allRecords.length)] : null;
    const journalHighlights = [
      allRecords.find((record) => record.title === "Ariana Grande — Positions" && record.edition.includes("Coke Bottle Clear")),
      allRecords.find((record) => record.title === "Skye Newman — SE9 Part 1 & 2"),
      allRecords.find((record) => record.title === "Sienna Spiro — The Visitor" && record.edition.includes("Tangerine")),
      allRecords.find((record) => /Eternal Sunshine Tour exclusive/.test(record.edition))
    ].filter(Boolean);
    return `
      <section class="collection-dashboard" aria-label="Collection overview">
        <div class="collection-dashboard-head">
          <div>
            <span class="dashboard-kicker">Collector’s index</span>
            <h2>Your collection, properly catalogued.</h2>
          </div>
          <p>Exact pressings, provenance, rarity and the personal details that make each copy yours. <strong>${journalRecords.length} pressings</strong> already carry a moment from Jay’s collection story.</p>
        </div>
        <div class="vault-feature-grid" aria-label="Vault highlights">
          ${latestAddition ? `<button class="vault-feature vault-feature--latest" type="button" data-record-id="${escapeAttr(latestAddition.id)}"><span class="vault-feature-art">${imageMarkup(latestAddition, "card")}</span><span><small>Latest known addition · ${escapeHTML(latestAddition.journal?.date || "date not recorded")}</small><strong>${escapeHTML(displayTitle(latestAddition))}</strong><em>${escapeHTML(latestAddition.artist)}</em></span><b>Open ↗</b></button>` : ""}
          ${recordOfWeek ? `<button class="vault-feature vault-feature--week" type="button" data-record-id="${escapeAttr(recordOfWeek.id)}"><span class="vault-feature-art">${imageMarkup(recordOfWeek, "card")}</span><span><small>Record of the week · rotates weekly</small><strong>${escapeHTML(displayTitle(recordOfWeek))}</strong><em>${escapeHTML(recordOfWeek.edition)}</em></span><b>Open ↗</b></button>` : ""}
          ${highestPaid ? `<button class="vault-feature vault-feature--paid" type="button" data-record-id="${escapeAttr(highestPaid.id)}"><span><small>Highest amount paid</small><strong>${escapeHTML(displayTitle(highestPaid))}</strong><em>${escapeHTML(money(highestPaid.price))} recorded purchase price · not a resale valuation</em></span><b>Details ↗</b></button>` : ""}
          <section class="vault-feature vault-feature--spinning" aria-label="Now Spinning">
            <div class="now-deck${previewRecordId === nowSpinningRecord?.id && previewAudio && !previewAudio.paused ? " is-playing" : ""}" aria-hidden="true"><span class="now-deck-platter">${nowSpinningRecord ? discMarkup(nowSpinningRecord, "pressing-disc pressing-disc--deck") : ""}</span><span class="now-deck-arm"></span></div>
            <div class="now-spinning-copy"><small>Now Spinning · saved on this device</small><strong>${nowSpinningRecord ? escapeHTML(displayTitle(nowSpinningRecord)) : "Choose the next spin"}</strong><em>${nowSpinningRecord ? escapeHTML(nowSpinningRecord.artist) : "Your listening-room centrepiece"}</em></div>
            <label class="sr-only" for="now-spinning-select">Choose a record for Now Spinning</label>
            <select id="now-spinning-select" data-now-spinning-select aria-label="Choose a record for Now Spinning"><option value="">Select a record…</option>${allRecords.map((record) => `<option value="${escapeAttr(record.id)}"${record.id === nowSpinningId ? " selected" : ""}>${escapeHTML(displayTitle(record))} · ${escapeHTML(record.artist)}</option>`).join("")}</select>
            ${nowSpinningRecord ? previewControlMarkup(nowSpinningRecord, "vault") : `<span class="now-spinning-note">Choose any owned pressing to set the turntable</span>`}
            ${nowSpinningRecord ? `<button type="button" class="now-spinning-open" data-record-id="${escapeAttr(nowSpinningRecord.id)}">Open full exhibit <span aria-hidden="true">↗</span></button>` : ""}
          </section>
        </div>
        <div class="collector-metrics">
          <article><span>Owned pressings</span><strong>${allRecords.length}</strong><small>in ${artistGroups.length} artist groups</small></article>
          <article><span>Rare pressings</span><strong>${rareCount}</strong><small>marked rare in the catalogue</small></article>
          <article><span>Signed / dedicated</span><strong>${signedCount}</strong><small>confirmed in the record notes</small></article>
          <article><span>Most collected artist</span><strong>${escapeHTML(artistGroups[0]?.name || "—")}</strong><small>${artistGroups[0]?.records.length || 0} pressings catalogued</small></article>
        </div>
        <div class="dashboard-split">
          <section class="crown-jewels">
            <div class="dashboard-section-title"><span>Crown jewels</span><small>Rare, exclusive and personally significant</small></div>
            <div class="jewel-rail">
              ${crownJewels.map((record, index) => `
                <button class="jewel-card" type="button" data-record-id="${escapeAttr(record.id)}">
                  <span class="jewel-number">0${index + 1}</span>
                  <span class="jewel-image-wrap">${imageMarkup(record, "card")}</span>
                  <span class="jewel-copy"><strong>${escapeHTML(displayTitle(record))}</strong><small>${escapeHTML(record.edition)}</small></span>
                </button>
              `).join("")}
            </div>
          </section>
          <section class="artist-pulse">
            <div class="dashboard-section-title"><span>Collection pulse</span><small>Largest artist groups</small></div>
            <ol>
              ${topArtists.map((group) => `
                <li><span>${escapeHTML(group.name)}</span><i><b style="width:${Math.max(12, (group.records.length / largest) * 100)}%"></b></i><strong>${group.records.length}</strong></li>
              `).join("")}
            </ol>
          </section>
        </div>
        <section class="journal-preview" aria-label="Collection journal highlights">
          <div class="dashboard-section-title"><span>The story so far</span><small>The moments that shaped the archive</small></div>
          <div class="journal-track">
            ${journalHighlights.map((record, index) => `
              <button class="journal-entry" type="button" data-record-id="${escapeAttr(record.id)}">
                <span class="journal-step">${String(index + 1).padStart(2, "0")}</span>
                <span class="journal-date">${escapeHTML(record.journal.date)}</span>
                <strong>${escapeHTML(displayTitle(record))}</strong>
                <span>${escapeHTML(record.journal.place)}</span>
              </button>
            `).join("")}
          </div>
        </section>
      </section>
    `;
  }

  function collectionModeNavigation() {
    const modes = [["gallery", "Gallery"], ["shelf", "Shelf"], ["families", "Album families"], ["stories", "Stories"], ["ariana", "Ariana archive"], ["value", "Value" ], ["ledger", "Ledger"]];
    return `<nav class="collection-mode-nav" aria-label="Explore the collection">${modes.map(([mode, label]) => `<button type="button" data-collection-mode="${mode}" aria-pressed="${state.collectionMode === mode}">${label}</button>`).join("")}</nav>`;
  }

  function updateNowSpinningBar() {
    const bar = document.querySelector("[data-now-spinning-open]");
    if (!bar) return;
    const selected = allRecords.find((record) => record.id === nowSpinningId);
    const label = bar.querySelector("[data-now-spinning-title]");
    const disc = bar.querySelector(".now-spinning-disc-slot");
    if (label) label.textContent = selected ? `${displayTitle(selected)} · ${selected.nowPlaying?.title || selected.artist}` : "Choose a record in the Vault";
    if (disc) disc.innerHTML = selected ? discMarkup(selected, "pressing-disc pressing-disc--mini") : "";
    if (selected) bar.dataset.recordId = selected.id;
    else delete bar.dataset.recordId;
    syncPreviewUI();
  }

  function recordCardRow(records) {
    return records.map((record, index) => cardMarkup(record, index)).join("");
  }

  // The approved Petal V6 prototype, adapted without changing its three-radio state machine.
  // All images are the exact two photographs supplied in chat and embedded as SVG image assets.
  function petalInteractiveMarkup(record) {
    const id = escapeAttr(record.id);
    return `
      <div class="shelf-record shelf-record--rare petal-v6" data-record-id="${id}" role="group" aria-label="Bad World Petal interactive vinyl">
        <input class="petal-v6-state" type="radio" name="petal-v6-${id}" id="petal-in-${id}" checked>
        <input class="petal-v6-state" type="radio" name="petal-v6-${id}" id="petal-out-${id}">
        <input class="petal-v6-state" type="radio" name="petal-v6-${id}" id="petal-playing-${id}">
        <div class="petal-v6-stage">
          <div class="petal-v6-art">
            <div class="petal-v6-vinyl"><div class="petal-v6-vinyl-art"><img src="assets/petal-bad-world-disc-original.svg" alt="Real Bad World Petal flower-filled disc" loading="lazy"></div></div>
            <div class="petal-v6-sleeve">
              <img src="assets/petal-bad-world-sleeve-original.svg" alt="Petal Bad World sleeve" loading="lazy">
              <label class="petal-v6-sleeve-label petal-v6-open" for="petal-out-${id}" aria-label="Pull vinyl out"></label>
              <label class="petal-v6-sleeve-label petal-v6-close" for="petal-in-${id}" aria-label="Put vinyl back and stop spinning"></label>
            </div>
          </div>
          <label class="petal-v6-hotspot petal-v6-start" for="petal-playing-${id}" aria-label="Spin the vinyl"></label>
          <label class="petal-v6-hotspot petal-v6-stop" for="petal-out-${id}" aria-label="Stop spinning"></label>
        </div>
        <div class="petal-v6-actions">
          <label class="petal-v6-action petal-v6-pull" for="petal-out-${id}">Pull out vinyl</label>
          <label class="petal-v6-action petal-v6-put" for="petal-in-${id}">Put vinyl back</label>
          <label class="petal-v6-action petal-v6-spin" for="petal-playing-${id}">Spin vinyl</label>
          <label class="petal-v6-action petal-v6-halt" for="petal-out-${id}">Stop spinning</label>
          <button type="button" class="petal-v6-details" data-petal-details="${id}">See details</button>
        </div>

      </div>`;
  }

  function collectionModeContent(groups, visibleRecords) {
    if (state.collectionMode === "gallery") return "";
    if (state.collectionMode === "shelf") return groups.map((group) => `
      <section class="archive-category shelf-category"><header class="category-head"><div><h2 class="category-title">${escapeHTML(group.name)}</h2><p class="shelf-hint">Tap a sleeve to pull out the record · tap the exposed disc to spin · Shelf layout V2</p></div><span>${group.records.length} ${group.records.length === 1 ? "record" : "records"}</span></header>
        <div class="shelf-rail" role="list" aria-label="${escapeAttr(group.name)} record shelf">${group.records.map((record) => record === badWorldPetal ? petalInteractiveMarkup(record) : `<button class="shelf-record${record.rare || record.extremelyRare ? " shelf-record--rare" : ""}${(record.discImage || /^assets\/tour-.*-white-background-2026\.jpeg$/.test(record.image)) ? " shelf-record--has-disc" : ""}" type="button" data-record-id="${escapeAttr(record.id)}" aria-label="Open ${escapeAttr(displayTitle(record))} by ${escapeAttr(record.artist)}"><span class="shelf-details-control" aria-hidden="true">See details</span>${record.discImage ? `<span class="shelf-disc-photo">${discMarkup(record, "pressing-disc shelf-disc-verified")}</span>` : /^assets\/tour-.*-white-background-2026\.jpeg$/.test(record.image) ? `<span class="shelf-disc-photo shelf-disc-cropped"><img src="${escapeAttr(record.image)}" alt="" loading="lazy"></span>` : ""}<span class="shelf-object"><span class="shelf-sleeve">${(record.sleeveImage || record.image) ? `<img src="${escapeAttr(record.sleeveImage || record.image)}" alt="" loading="lazy">` : ""}</span></span></button>`).join("")}</div>
      </section>`).join("");
    if (state.collectionMode === "stories") {
      const tourRecords = allRecords.filter((record) => /Eternal Sunshine Tour exclusive/i.test(record.edition));
      const entries = allRecords.filter((record) => record.journal && !tourRecords.includes(record)).slice().sort((a, b) => journalSortValue(b.journal.date) - journalSortValue(a.journal.date));
      const tourLead = tourRecords[0];
      const tourEntry = tourLead ? `<li class="story-tour-group"><span class="timeline-marker"></span><time>27 August 2026</time><button type="button" class="timeline-record" data-record-id="${escapeAttr(tourLead.id)}"><strong>Eternal Sunshine Tour Exclusive Variants</strong><small>Ariana Grande · London tour pop-up</small><p>On the morning of Jay’s first tour show, he and Millie reached the pop-up at around 11am and found a virtual queue already over six hours long. At exactly 11:11, Jay refreshed the sold-out Eventbrite page and one 12pm ticket appeared. He got it—the only returned ticket he ever saw—and walked in just after staff announced the entire vinyl set had finally been restocked.</p><span class="story-tour-list">${tourRecords.map((record) => escapeHTML(displayTitle(record))).join(" · ")}</span><b>Open the set ↗</b></button></li>` : "";
      return `<section class="collection-mode-panel story-archive"><header><span class="dashboard-kicker">Personal provenance</span><h2>The story behind the sleeves.</h2><p>The records hold the music. These are the moments that made each one part of Jay’s archive.</p></header><ol class="story-timeline">${tourEntry}${entries.map((record) => `<li><span class="timeline-marker"></span><time>${escapeHTML(record.journal.date.replace(" · date not recorded", ""))}</time><button type="button" class="timeline-record" data-record-id="${escapeAttr(record.id)}"><strong>${escapeHTML(displayTitle(record))}</strong><small>${escapeHTML(record.artist)} · ${escapeHTML(record.journal.place)}</small><p>${escapeHTML(record.journal.note)}</p><b>Open record ↗</b></button></li>`).join("")}</ol></section>`;
    }
    if (state.collectionMode === "ariana") {
      const ownedRate = trackedAriana.length ? Math.round((arianaOwned.length / trackedAriana.length) * 100) : 0;
      const trackerText = (record) => `${record.title} ${record.edition} ${record.description}`;
      const isTour = (record) => /eternal sunshine tour|tour exclusive/i.test(trackerText(record));
      const isRsd = (record) => /record store day|\brsd\b/i.test(trackerText(record));
      const isLive = (record) => /\blive\b|\bswt live\b/i.test(trackerText(record));
      const isSingle = (record) => /7[”\"]|7-inch|7 inch|flexi|\bsingle\b/i.test(`${record.title} ${record.edition}`);
      const isDeluxe = (record) => /\bdeluxe\b|anniversary/i.test(trackerText(record));
      const isStudio = (record) => !isSingle(record) && !isLive(record) && !isRsd(record) && !isTour(record) && !isDeluxe(record);
      const formats = [
        ["Studio albums & variants", trackedAriana.filter(isStudio)],
        ["Deluxe & anniversary editions", trackedAriana.filter((record) => isDeluxe(record) && !isSingle(record) && !isTour(record))],
        ["Official singles", trackedAriana.filter(isSingle)],
        ["Live albums", trackedAriana.filter(isLive)],
        ["Record Store Day releases", trackedAriana.filter(isRsd)],
        ["Tour exclusives", trackedAriana.filter(isTour)]
      ].filter(([, records]) => records.length);
      return `<section class="collection-mode-panel ariana-vault"><header><span class="dashboard-kicker">Discography tracker</span><h2>Ariana Grande · tracked pressings</h2><p>This percentage is only against releases currently catalogued here—not a claim that the full official discography is complete. Release types may overlap where a pressing is both live and RSD.</p></header><div class="completion-card"><div><small>Tracked copies owned</small><strong>${arianaOwned.length} <i>/ ${trackedAriana.length}</i></strong><span>${ownedRate}% of this tracked set owned · ${arianaWatched.length} missing</span></div><div class="completion-ring" style="--completion:${ownedRate}%"><span>${ownedRate}%</span></div></div><div class="completion-breakdown">${formats.map(([label, records]) => `<article><small>${escapeHTML(label)}</small><strong>${records.filter((record) => !record.wishlist).length}<i> / ${records.length}</i></strong><span>${records.filter((record) => record.wishlist).length} still wanted</span></article>`).join("")}</div>${formats.map(([label, records]) => `<section class="tracked-format"><header><h3>${escapeHTML(label)}</h3><span>${records.filter((record) => !record.wishlist).length} owned · ${records.filter((record) => record.wishlist).length} wanted</span></header><div class="archive-grid">${recordCardRow(records)}</div></section>`).join("")}<details class="completion-missing"><summary><span>Missing pressings</span><strong>${arianaWatched.length} tracked wants</strong></summary><div>${arianaWatched.map((record) => `<button type="button" data-record-id="${escapeAttr(record.id)}"><span>${escapeHTML(displayTitle(record))}</span><small>${escapeHTML(record.edition)}</small><b>${escapeHTML(displayPriceText(record))}</b></button>`).join("")}</div></details></section>`;
    }
    if (state.collectionMode === "families") {
      if (state.activeFamilyKey) {
        const family = albumFamilies.find((entry) => entry.key === state.activeFamilyKey);
        if (family) return `<section class="collection-mode-panel family-detail"><button type="button" class="family-back" data-family-back>← All album families</button><header><span class="dashboard-kicker">${escapeHTML(family.artist)} · album family</span><h2>${escapeHTML(family.title)}</h2><p>${family.owned} owned${family.wanted ? ` · ${family.wanted} wanted` : ""}. Variants are shown as separate physical copies.</p></header><div class="family-fan">${recordCardRow(family.records)}</div></section>`;
      }
      return `<section class="collection-mode-panel family-archive"><header><span class="dashboard-kicker">Album families</span><h2>Collected as chapters, not a flat list.</h2><p>Each family is grouped by the exact release title in the catalogue. Related eras are not guessed where the relationship is unclear.</p></header><div class="family-grid">${albumFamilies.map((family) => {
        const lead = family.records.find((record) => !record.wishlist) || family.records[0];
        return `<button class="family-card" type="button" data-family-key="${escapeAttr(family.key)}"><span class="family-art">${imageMarkup(lead, "card")}</span><span class="family-copy"><small>${escapeHTML(family.artist)}</small><strong>${escapeHTML(family.title)}</strong><em>${family.owned} owned${family.wanted ? ` · ${family.wanted} wanted` : ""}</em><b>Open family · ${family.records.length} ${family.records.length === 1 ? "copy" : "copies"} ↗</b></span></button>`;
      }).join("")}</div></section>`;
    }
    if (state.collectionMode === "value") {
      const mostPaid = allRecords.slice().sort((a, b) => b.price - a.price)[0];
      const leastPaid = allRecords.slice().sort((a, b) => a.price - b.price)[0];
      return `<section class="collection-mode-panel value-archive"><header><span class="dashboard-kicker">Value mode</span><h2>Paid price and market value are different things.</h2><p>Only your recorded purchase prices are stored here. Current value, appreciation and bargain rankings are deliberately withheld until comparable completed-sale data is verified.</p></header><div class="value-grid"><article><small>Amount paid · PIN-protected</small><strong>£••••.••</strong><span>Unlock with your existing collection PIN</span><button type="button" data-total-trigger>Unlock totals</button></article><article><small>Current estimated value</small><strong>Not yet verified</strong><span>No reliable sold-comps ledger is stored yet; no asking-price estimate is being presented as fact.</span></article><article><small>Highest amount paid</small><strong>${escapeHTML(money(mostPaid?.price || 0))}</strong><span>${escapeHTML(mostPaid ? displayTitle(mostPaid) : "—")} · individual purchase prices remain visible</span></article><article><small>Lowest amount paid</small><strong>${escapeHTML(money(leastPaid?.price || 0))}</strong><span>${escapeHTML(leastPaid ? displayTitle(leastPaid) : "—")} · among recorded owned copies</span></article></div><p class="value-note">A proper value mode needs dated, condition-matched sold listings—not optimistic asking prices. Until those are tracked, “difference” and “highest appreciation” would be made-up numbers.</p></section>`;
    }
    return "";
  }

  function journalSortValue(value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.getTime();
    const month = /october/i.test(value) ? 9 : /september/i.test(value) ? 8 : /august/i.test(value) ? 7 : 0;
    const year = Number(value.match(/20\d{2}/)?.[0]) || 2026;
    const day = Number(value.match(/\b\d{1,2}\b/)?.[0]) || 1;
    return new Date(year, month, day).getTime();
  }

  function wishlistDashboard() {
    const priorityRecords = wishlistRecords.filter((record) => record.highPriority).sort((a, b) => a.rank - b.rank);
    const availableCount = wishlistRecords.filter((record) => /in stock|pre-order open|resale available/i.test(record.market.availability)).length;
    const soldOutCount = wishlistRecords.filter((record) => /sold out/i.test(record.market.availability)).length;
    const ukCount = wishlistRecords.filter((record) => record.market.ukListing).length;
    const filters = [
      ["all", "All"],
      ["priority", "High priority"],
      ["available", "Available now"],
      ["sold-out", "Sold out"],
      ["uk", "UK listings"]
    ];
    return `
      <section class="wishlist-command" aria-label="Wishlist market watch controls">
        <div class="wishlist-command-head">
          <div>
            <span class="wishlist-kicker">Market Watch</span>
            <h2>Wishlist intelligence</h2>
            <p>Verified stock, delivered-price context and seller risk — without losing the exact pressing.</p>
          </div>
          <span class="wishlist-live-stamp"><i></i> Last audit 19 Oct 2026</span>
        </div>
        <div class="wishlist-overview" aria-label="Wishlist overview">
          <div><span>High priority</span><strong>${priorityRecords.length}</strong></div>
          <div><span>Available now</span><strong>${availableCount}</strong></div>
          <div><span>Sold out</span><strong>${soldOutCount}</strong></div>
          <div><span>UK listings</span><strong>${ukCount}</strong></div>
        </div>
        <div class="priority-watch" aria-label="Priority watches">
          ${priorityRecords.map((record) => `
            <button class="wishlist-priority-card" type="button" data-record-id="${escapeAttr(record.id)}">
              <span class="priority-art">${imageMarkup(record, "card")}</span>
              <span><small>Priority watch</small><strong>${escapeHTML(displayTitle(record))}</strong><em>${escapeHTML(displayPriceText(record))}</em></span>
              <b aria-hidden="true">↗</b>
            </button>
          `).join("")}
        </div>
        <div class="wishlist-filters" role="group" aria-label="Filter wishlist">
          ${filters.map(([value, label]) => `<button class="wishlist-filter" type="button" data-wishlist-filter="${value}" aria-pressed="${state.wishlistFilter === value}">${label}</button>`).join("")}
        </div>
        <details class="activity-feed">
          <summary><span>Latest watch activity</span><small>${wishlistActivity.length} updates</small></summary>
          <ol>
            ${wishlistActivity.map((item) => `
              <li>
                <time>${escapeHTML(item.date)}</time>
                <span class="activity-status">${escapeHTML(item.status)}</span>
                <strong>${escapeHTML(item.title)}</strong>
                <p>${escapeHTML(item.detail)}</p>
              </li>
            `).join("")}
          </ol>
        </details>
      </section>
    `;
  }

  function imageMarkup(record, type) {
    const imageClass = type === "modal" ? "modal-image" : "card-image";
    if (!record.image) return "";
    const alternate = [record.imageSource, record.referenceImage].find((url) => url && url !== record.image) || "";
    return `<img class="${imageClass}" src="${escapeAttr(record.image)}" alt="${escapeAttr(`${record.title} — ${record.edition}`)}" ${alternate ? `data-artwork-alternate="${escapeAttr(alternate)}"` : ""} ${type === "card" ? 'loading="lazy"' : ""}>`;
  }

  // Preserve the exact pressing artwork: try its original alternate image, if any.
  // If neither image loads, reveal the existing title fallback instead of a broken icon.
  document.addEventListener("error", (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.matches(".card-image, .modal-image")) return;
    const alternate = img.dataset.artworkAlternate;
    if (alternate && !img.dataset.artworkRetried) {
      img.dataset.artworkRetried = "true";
      img.src = alternate;
      return;
    }
    img.style.display = "none";
    const fallback = img.parentElement?.querySelector(".card-fallback");
    if (fallback) fallback.style.display = "";
  }, true);

  function cardTags(record) {
    const tags = [];
    const text = `${record.edition || ""} ${record.description || ""} ${record.facts.map((fact) => `${fact.label} ${fact.value}`).join(" ")}`.toLowerCase();
    const variantText = `${record.edition || ""} ${record.facts.filter((fact) => /record|pressing|format/i.test(fact.label)).map((fact) => fact.value).join(" ")}`.toLowerCase();
    if (record.wishlist) tags.push("WANTED");
    if (record.highPriority) tags.push("HIGH PRIORITY");
    if (record.extremelyRare) tags.push("EXTREMELY RARE");
    else if (record.rare) tags.push("RARE");
    if (record.outOfStock) tags.push("OUT OF STOCK");
    if (/record store day|\brsd\b/.test(text)) tags.push("RSD EXCLUSIVE");
    if (/eternal sunshine tour|tour exclusive/.test(text)) tags.push("TOUR EXCLUSIVE");
    if ((record.limitedEdition || /limited|collector|numbered/.test(text)) && !tags.includes("RSD EXCLUSIVE") && !tags.includes("TOUR EXCLUSIVE")) tags.push("LIMITED EDITION");
    if (!record.suppressVariant && (record.variant || /colour|color|splatter|marble|clear|opaque|picture disc|pink|green|blue|red|orange|cream|alternate cover|alternative cover|indie exclusive/.test(variantText))) tags.push("VARIANT");
    return [...new Set(tags)];
  }

  function cardMarkup(record, visibleIndex) {
    const tags = cardTags(record);
    const hardToFind = record.rare || record.extremelyRare;
    const strongTags = new Set(["RARE", "EXTREMELY RARE", "HIGH PRIORITY"]);
    const priceMarkup = `<span class="card-price${record.wishlist ? " card-price--wishlist" : ""}">${escapeHTML(displayPriceText(record))}</span>`;
    return `
      <button class="vinyl-card${record.setup ? " vinyl-card--setup" : ""}${record.wishlist ? " vinyl-card--wishlist" : ""}${hardToFind ? " vinyl-card--rare" : ""}${record.extremelyRare ? " vinyl-card--extremely-rare" : ""}${tags.length > 1 ? " vinyl-card--tagged" : ""}" type="button" data-record-id="${escapeAttr(record.id)}" aria-label="${escapeAttr([record.title, ...tags].join(" · "))}. Open details">
        <span class="card-art">
          <span class="card-fallback">${escapeHTML(displayTitle(record))}</span>
          ${imageMarkup(record, "card")}
          ${priceMarkup}
        </span>
        ${tags.length ? `<span class="card-tags" aria-hidden="true">${tags.map((tag) => `<span class="card-tag card-tag--${slug(tag)}${strongTags.has(tag) ? " card-tag--strong" : ""}">${escapeHTML(tag)}</span>`).join("")}</span>` : ""}
        <span class="card-copy">
          <span class="card-title">${escapeHTML(displayTitle(record))}</span>
          <span class="card-edition">${escapeHTML(record.edition)}</span>
          ${record.journal ? `<span class="card-journal"><i></i>${escapeHTML(record.journal.date)} · story recorded</span>` : ""}
          ${record.wishlist ? `<span class="card-market"><b>${escapeHTML(record.market.availability)}</b><span>${escapeHTML(record.market.lastChecked)}</span></span>` : ""}
        </span>
      </button>
    `;
  }

  function renderCollection() {
    renderFormatFilters();
    if (state.page === "home") {
      summaryNode.innerHTML = "";
      sectionsNode.innerHTML = "";
      updateTotalPrivacy();
      updateNowSpinningBar();
      return;
    }
    const groups = visibleGroups();
    const visibleRecords = groups.flatMap((group) => group.records);
    const total = visibleRecords.reduce((sum, record) => sum + record.price, 0);
    const scope = state.artist === "All" ? "all artists" : state.artist;
    searchNode.placeholder = state.view === "wishlist" ? "Search the wishlist" : state.view === "setup" ? "Search the dream setup" : "Search the archive";
    sortNode.disabled = false;
    sectionsNode.classList.toggle("is-ledger", state.layout === "ledger");
    document.querySelectorAll("[data-layout]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.layout === state.layout)));
    sectionsNode.classList.toggle("is-shelf", state.view === "collection" && state.collectionMode === "shelf");
    summaryNode.innerHTML = state.view === "wishlist"
      ? `<span><strong>${visibleRecords.length}</strong> wanted records and release watches</span><span>Wishlist · retailer stock is a last-checked snapshot</span>`
      : state.view === "setup"
      ? `<span><strong>${visibleRecords.length}</strong> dream setup pieces</span><span>${escapeHTML(money(setupTotal))} target · excluded from collection totals</span>`
      : `<span>Showing <strong>${visibleRecords.length}</strong> of ${allRecords.length} pressings</span><span>${escapeHTML(scope)} · ${privatePriceMarkup(money(total), "collection-total-price", "£••••.••")}</span>`;

    if (!visibleRecords.length && !(state.view === "collection" && !["gallery", "ledger"].includes(state.collectionMode))) {
      sectionsNode.innerHTML = `
        <div class="empty-state">
          <div><strong>No records found.</strong><span>Try a different artist, album or edition.</span></div>
        </div>
      `;
      updateTotalPrivacy();
      return;
    }

    let visibleIndex = 0;
    const completedSetupCount = setupItems.filter((item) => setupProgress[item.id]).length;
    const remainingSetupCost = setupItems.filter((item) => !setupProgress[item.id]).reduce((sum, item) => sum + item.price, 0);
    const currentSetupMarkup = `
      <div class="current-setup-card"><span class="current-setup-icon">◉</span><div><small>Current setup · confirmed</small><strong>Crosley suitcase record player</strong><p>Your current all-in-one player. The planned AT-LP70XBT + Kanto system is shown separately below, so the dream plan never pretends it is already owned.</p></div></div>`;
    const setupIntro = state.view === "setup" ? `
      <section class="setup-studio" aria-label="Dream listening room plan">
        <div class="setup-studio-head">
          <div><span class="setup-plan-kicker">The Listening Room · listening system</span><h2>Build the sound. Keep the feeling.</h2><p class="setup-subtitle">Your real system, the equipment you want, and the next useful upgrade. No imaginary purchases.</p></div>
          <div class="setup-budget"><small>${state.setupMode === "current" ? "Planned system" : "Dream system total"}</small><strong>${escapeHTML(money(setupTotal))}</strong><span>${completedSetupCount} of ${setupItems.length} marked bought · ${escapeHTML(money(remainingSetupCost))} still planned on this device</span></div>
        </div>
        <div class="setup-mode-switch" role="tablist" aria-label="Setup view"><button type="button" role="tab" data-setup-mode="current" aria-selected="${state.setupMode === "current"}">Current setup</button><button type="button" role="tab" data-setup-mode="dream" aria-selected="${state.setupMode === "dream"}">Dream setup</button></div>
        ${state.setupMode === "current" ? currentSetupMarkup : ""}
        ${state.setupMode === "dream" ? `
        <div class="planner-progress-note">Plan progress is stored in this browser only. Marking a piece bought here does not add it to the owned collection automatically.</div>
        <div class="listening-milestones"><div><small>01 · Your current sound</small><strong>Crosley suitcase</strong><span>Keep as the reference point until your upgrade is ready.</span></div><div><small>02 · The next upgrade</small><strong>${escapeHTML(setupItems.find((item) => !setupProgress[item.id])?.title || "All planned items marked bought")}</strong><span>${escapeHTML(money(remainingSetupCost))} remaining in your equipment plan.</span></div><div><small>03 · Your destination</small><strong>Proper stereo listening</strong><span>Turntable, separate speakers and a cabinet built around the records.</span></div></div>
        <div class="setup-plan-grid">${setupItems.map((item, index) => `<article class="setup-plan-item${setupProgress[item.id] ? " is-complete" : ""}"><span>${String(index + 1).padStart(2, "0")}</span><div><small>${setupProgress[item.id] ? "Marked bought · planner only" : "Planned component"}</small><strong>${escapeHTML(item.title)}</strong><em>${escapeHTML(money(item.price))}</em></div><button type="button" data-setup-toggle="${escapeAttr(item.id)}" aria-pressed="${Boolean(setupProgress[item.id] || false)}">${setupProgress[item.id] ? "Bought ✓" : "Mark bought"}</button></article>`).join("")}</div>
        ` : ""}
        <div class="signal-path" aria-label="Recommended signal path">
          <span><i>01</i><b>AT-LP70XBT</b><small>Turntable · LINE out</small></span>
          <button type="button" class="connection-toggle" data-connection-toggle aria-pressed="${state.connection === "bluetooth"}">Switch to ${state.connection === "wired" ? "Bluetooth" : "RCA"}</button>
          <span><i>02</i><b>Kanto YU4</b><small>Powered speakers · LINE in</small></span>
          <em>${state.connection === "wired" ? "RCA SIGNAL" : "WIRELESS"}</em>
          <span><i>03</i><b>Listening position</b><small>Desk-centred stereo image</small></span>
        </div>
        <section class="speaker-placement" aria-label="Room placement diagram"><div><span>ROOM PLAN</span><small>Tap a point for the component notes</small></div><div class="room-map"><button type="button" class="room-point room-point--deck" data-room-point="setup-at-lp70xbt"><i>01</i><strong>Turntable</strong><small>Cabinet beside desk</small></button><button type="button" class="room-point room-point--left" data-room-point="setup-kanto-yu4"><i>02</i><strong>Left speaker</strong><small>Desk · ear height</small></button><button type="button" class="room-point room-point--right" data-room-point="setup-kanto-yu4"><i>03</i><strong>Right speaker</strong><small>Desk · ear height</small></button><span class="room-listener"><i>YOU</i><small>Listening seat</small></span><span class="room-path-line"></span></div></section>
        <div class="setup-notes">
          <p><strong>Placement:</strong> deck on the Jaxon cabinet, speakers on the desk. Separate surfaces keep bass vibration away from the stylus.</p>
          <p><strong>Upgrade path:</strong> buy the cabinet and turntable first, add the YU4 pair, then swap to the green elliptical stylus once the system is settled.</p>
        </div>
        <div class="setup-notes"><p><strong>Before buying:</strong> confirm cabinet dimensions, speaker placement, phono/line settings and stylus compatibility against the exact model manuals. This plan is a guide, not a guarantee of compatibility.</p></div>
        <div class="setup-roadmap" aria-label="Recommended buying order">
          <span>Buy order</span>
          <ol>
            <li><b>01</b><strong>Cabinet</strong><small>Build the isolated home first</small></li>
            <li><b>02</b><strong>Turntable</strong><small>Core source component</small></li>
            <li><b>03</b><strong>Speakers</strong><small>Complete the wired system</small></li>
            <li><b>04</b><strong>Stylus</strong><small>Upgrade after everything settles</small></li>
          </ol>
        </div>
      </section>
    ` : "";
    const wishlistIntro = state.view === "wishlist" ? wishlistDashboard() : "";
    const collectionIntro = state.view === "collection" ? `${state.artist === "All" && !state.query ? collectionModeNavigation() : ""}` : "";
    const collectionMode = state.view === "collection" ? collectionModeContent(groups, visibleRecords) : "";
    const listings = state.view === "collection" && !["gallery", "ledger"].includes(state.collectionMode) ? "" : groups.map((group) => {
      const groupTotal = group.records.reduce((sum, record) => sum + record.price, 0);
      const cards = group.records.map((record) => cardMarkup(record, visibleIndex++)).join("");
      return `
        <section class="archive-category" aria-labelledby="${escapeAttr(slug(group.name))}-title">
          <header class="category-head">
            <div>
              <h2 class="category-title" id="${escapeAttr(slug(group.name))}-title">${escapeHTML(group.name)}</h2>
            </div>
            <div class="category-meta">
              ${state.view === "wishlist" ? "" : state.view === "setup" ? `<span class="category-total">${escapeHTML(money(groupTotal))}</span>` : privatePriceMarkup(money(groupTotal), "category-total", "£••••.••")}
              <span>${group.records.length} ${state.view === "wishlist" ? (group.records.length === 1 ? "wanted release" : "wanted releases") : state.view === "setup" ? (group.records.length === 1 ? "piece" : "pieces") : (group.records.length === 1 ? "pressing" : "pressings")}</span>
            </div>
          </header>
          <div class="archive-grid">${cards}</div>
        </section>
      `;
    }).join("");
    sectionsNode.innerHTML = collectionIntro + wishlistIntro + setupIntro + collectionMode + listings;

    sectionsNode.querySelectorAll("[data-petal-details]").forEach((button) => {
      button.addEventListener("click", () => openRecord(button.dataset.petalDetails));
    });
    // A photographed disc has three states: sleeved, pulled out, spinning.
    // Closing the sleeve resets both the animation and the state.
    // Details is intentionally a separate control above each sleeve.
    sectionsNode.querySelectorAll(".shelf-record:not(.petal-v6)").forEach((card) => {
      card.addEventListener("click", (event) => {
        const details = event.target.closest(".shelf-details-control");
        if (details) {
          event.preventDefault();
          event.stopImmediatePropagation();
          openRecord(card.dataset.recordId);
        }
      }, true);
    });
    sectionsNode.querySelectorAll(".shelf-record--has-disc").forEach((card) => {
      const disc = card.querySelector(".shelf-disc-photo");
      const sleeve = card.querySelector(".shelf-sleeve");
      const setState = (next) => {
        card.dataset.vinylState = next;
        card.classList.toggle("is-pulled", next !== "sleeved");
        card.classList.toggle("is-spinning", next === "spinning");
        card.setAttribute("aria-label", next === "sleeved" ? "Pull out vinyl" : "Put vinyl back into sleeve");
        card.setAttribute("aria-pressed", String(next !== "sleeved"));
      };
      setState("sleeved");
      // Hovering over the exposed edge finishes pulling the record out.
      // Clicking the exposed disc remains reserved for starting/stopping spin.
      if (disc && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        disc.addEventListener("mouseenter", () => {
          if (card.dataset.vinylState === "sleeved") setState("pulled");
        });
      }
      // Retract automatically after leaving the entire sleeve/disc interaction.
      // Keep an actively spinning record displayed until the user stops it.
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        card.addEventListener("mouseleave", () => {
          if (card.dataset.vinylState === "pulled") setState("sleeved");
        });
      }
      // The pulled-out disc extends beyond the sleeve button's original box.
      // Listen on the disc itself so its whole exposed surface can start/stop rotation.
      if (disc) {
        disc.addEventListener("click", (event) => {
          if (card.dataset.vinylState === "sleeved") return;
          event.preventDefault();
          event.stopPropagation();
          const current = card.dataset.vinylState;
          if (current === "spinning") {
            if (previewRecordId === card.dataset.recordId && previewAudio && !previewAudio.paused) previewAudio.pause();
            setState("pulled");
          } else {
            const record = allRecords.find((item) => item.id === card.dataset.recordId);
            if (!record?.nowPlaying?.url) {
              showArchiveToast("No audio preview is available for this pressing yet");
              setState("pulled");
            } else {
              setState("spinning");
              if (!(previewRecordId === card.dataset.recordId && previewAudio && !previewAudio.paused)) {
                togglePreview(card.dataset.recordId);
              }
            }
          }
        });
      }
      // Stop the button's default record-details action; this is an interactive shelf.
      card.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const current = card.dataset.vinylState;
        const bounds = sleeve.getBoundingClientRect();
        const clickedExposedDisc = current !== "sleeved" && event.clientX > bounds.right;
        if (clickedExposedDisc && disc) {
          if (current === "spinning") {
            if (previewRecordId === card.dataset.recordId && previewAudio && !previewAudio.paused) previewAudio.pause();
            setState("pulled");
          } else {
            const record = allRecords.find((item) => item.id === card.dataset.recordId);
            if (!record?.nowPlaying?.url) {
              showArchiveToast("No audio preview is available for this pressing yet");
              setState("pulled");
            } else {
              setState("spinning");
              if (!(previewRecordId === card.dataset.recordId && previewAudio && !previewAudio.paused)) {
                togglePreview(card.dataset.recordId);
              }
            }
          }
        } else {
          setState(current === "sleeved" ? "pulled" : "sleeved");
        }
      });
    });
    sectionsNode.querySelectorAll(".shelf-record:not(.shelf-record--has-disc):not(.petal-v6)").forEach((card) => {
      card.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        card.classList.toggle("is-pulled");
      });
    });
    sectionsNode.querySelectorAll(".vinyl-card").forEach((card) => {
      card.addEventListener("click", () => openRecord(card.dataset.recordId));
    });
    sectionsNode.querySelectorAll(".jewel-card, .journal-entry, .wishlist-priority-card, .timeline-record, .story-gaps button, .vault-feature:not(.vault-feature--spinning)").forEach((card) => {
      card.addEventListener("click", () => openRecord(card.dataset.recordId));
    });
    sectionsNode.querySelectorAll("[data-family-key]").forEach((button) => button.addEventListener("click", () => {
      state.activeFamilyKey = button.dataset.familyKey;
      renderCollection();
      sectionsNode.querySelector(".family-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    sectionsNode.querySelector("[data-family-back]")?.addEventListener("click", () => {
      state.activeFamilyKey = "";
      renderCollection();
      sectionsNode.querySelector(".family-archive")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    sectionsNode.querySelectorAll("[data-collection-mode]").forEach((button) => button.addEventListener("click", () => {
      state.collectionMode = button.dataset.collectionMode;
      state.activeFamilyKey = "";
      if (["gallery", "shelf", "ledger"].includes(state.collectionMode)) state.layout = state.collectionMode;
      state.artist = "All";
      state.query = "";
      searchNode.value = "";
      renderCollection();
      sectionsNode.querySelector(".collection-mode-nav")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    sectionsNode.querySelectorAll("[data-setup-mode]").forEach((button) => button.addEventListener("click", () => {
      state.setupMode = button.dataset.setupMode;
      renderCollection();
    }));
    sectionsNode.querySelectorAll("[data-setup-toggle]").forEach((button) => button.addEventListener("click", () => {
      const id = button.dataset.setupToggle;
      setupProgress[id] = !setupProgress[id];
      try { localStorage.setItem(setupProgressKey, JSON.stringify(setupProgress)); } catch (_) {}
      renderCollection();
    }));
    sectionsNode.querySelectorAll("[data-connection-toggle]").forEach((button) => button.addEventListener("click", () => {
      state.connection = state.connection === "wired" ? "bluetooth" : "wired";
      renderCollection();
    }));
    sectionsNode.querySelectorAll("[data-room-point]").forEach((button) => button.addEventListener("click", () => openRecord(button.dataset.roomPoint)));
    sectionsNode.querySelectorAll("[data-total-trigger]").forEach((button) => button.addEventListener("click", openTotalPin));
    sectionsNode.querySelectorAll("[data-wishlist-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.wishlistFilter = button.dataset.wishlistFilter;
        renderCollection();
      });
    });
    sectionsNode.querySelectorAll(".card-image").forEach((image) => {
      image.addEventListener("error", () => image.closest(".card-art")?.classList.add("is-missing"), { once: true });
    });
    updateTotalPrivacy();
    updateNowSpinningBar();
  }

  function currentModalRecords() {
    return visibleGroups().flatMap((group) => group.records);
  }

  function openRecord(id) {
    const record = allRecords.concat(wishlistRecords, setupItems).find((item) => item.id === id);
    if (!record) return;
    showRecordLoader(record);
    const modalRecords = currentModalRecords();
    const activeIndex = modalRecords.findIndex((item) => item.id === id);
    state.activeId = id;
    if (modalNode.hidden) lastFocus = document.activeElement;

    const facts = record.facts
      .filter((fact) => !["paid", "edition", "status"].includes(fact.label.toLowerCase()))
      .map((fact) => fact.label.toLowerCase() === "status" ? { ...fact, value: displayPriceText(record, fact.value) } : fact);
    const market = record.wishlist ? record.market : null;
    const modalTags = cardTags(record);
    const deal = dealLabel(market);
    const previousRecord = activeIndex > 0 ? modalRecords[activeIndex - 1] : null;
    const nextRecord = activeIndex >= 0 && activeIndex < modalRecords.length - 1 ? modalRecords[activeIndex + 1] : null;
    const gallery = Array.from(new Set([record.image, ...(record.gallery || [])].filter(Boolean)));
    let galleryIndex = 0;
    const notesHeading = record.setup ? "Why it belongs in the setup" : record.wishlist ? "Release notes" : "Pressing notes";
    const identity = record.wishlist ? {
      catalogue: market?.catalogueNumber || "Not added yet",
      discogs: market?.discogsId || "Not linked yet",
      source: retailerName(record)
    } : null;
    const links = [];
    if (record.source) links.push(`<a class="modal-link" href="${escapeAttr(record.source)}" target="_blank" rel="external noreferrer">${record.setup ? "View product source ↗" : "View edition source ↗"}</a>`);
    if (market?.marketUrl && market.marketUrl !== record.source) links.unshift(`<a class="modal-link modal-link--primary" href="${escapeAttr(market.marketUrl)}" target="_blank" rel="external noreferrer">Open best live listing ↗</a>`);
    if (record.imageSource && record.imageSource !== record.source) links.push(`<a class="modal-link" href="${escapeAttr(record.imageSource)}" target="_blank" rel="noreferrer">View artwork ↗</a>`);
    const archiveRows = [
      ["Condition", record.facts.find((fact) => /condition/i.test(fact.label))?.value],
      ["Play history", record.facts.find((fact) => /played|play history/i.test(fact.label))?.value],
      ["Retailer / source", record.journal?.place || retailerName(record)],
      ["Catalogue / barcode", record.catalogueNumber || record.facts.find((fact) => /catalogue|barcode/i.test(fact.label))?.value],
      ["Discogs release", record.discogsId]
    ].filter(([, value]) => value);

    const marketMarkup = market ? `
      <section class="market-watch" aria-label="Market Watch">
        <div class="market-watch-head">
          <div><span>Market Watch</span><strong>${escapeHTML(market.availability)}</strong></div>
          <span class="deal-indicator deal-indicator--${deal.tone}">${deal.label}</span>
        </div>
        <div class="market-grid">
          <div><span>Best listing</span><strong>${escapeHTML(market.listing)}</strong><small>${escapeHTML(market.seller)}</small></div>
          <div><span>Condition</span><strong>${escapeHTML(market.condition)}</strong><small>${escapeHTML(market.movement)}</small></div>
          <div><span>Item price</span><strong>${market.itemPrice == null ? "—" : escapeHTML(money(market.itemPrice))}</strong><small>${escapeHTML(market.shipping)}</small></div>
          <div><span>Delivered total</span><strong>${market.deliveredTotal == null ? "Not confirmed" : escapeHTML(money(market.deliveredTotal))}</strong><small>${market.targetPrice ? `Target ${escapeHTML(money(market.targetPrice))}` : "No target set"}</small></div>
        </div>
        <p class="market-risk"><strong>Seller check</strong>${escapeHTML(market.risk)}</p>
        <span class="market-checked">Last checked ${escapeHTML(market.lastChecked)}</span>
      </section>
      <details class="price-history">
        <summary>Price history <span>${market.history.length} ${market.history.length === 1 ? "entry" : "entries"}</span></summary>
        <ol>${market.history.map((point) => `<li><time>${escapeHTML(point.date)}</time><strong>${escapeHTML(point.value)}</strong><span>${escapeHTML(point.note)}</span></li>`).join("")}</ol>
      </details>
      <details class="pressing-identity">
        <summary>Pressing identity</summary>
        <dl>
          <div><dt>Catalogue / barcode</dt><dd>${escapeHTML(identity.catalogue)}</dd></div>
          <div><dt>Discogs release ID</dt><dd>${escapeHTML(identity.discogs)}</dd></div>
          <div><dt>Primary source</dt><dd>${escapeHTML(identity.source)}</dd></div>
        </dl>
      </details>
      <details class="pressing-gallery">
        <summary>Pressing gallery <span>${record.gallery.length} image${record.gallery.length === 1 ? "" : "s"}</span></summary>
        <div class="pressing-gallery-grid">${record.gallery.map((image, index) => `<a href="${escapeAttr(image)}" target="_blank" rel="noreferrer"><img src="${escapeAttr(image)}" alt="${escapeAttr(`${displayTitle(record)} pressing image ${index + 1}`)}" loading="lazy"></a>`).join("")}</div>
      </details>
    ` : "";

    modalPanel.innerHTML = `
      <button class="modal-close" type="button" aria-label="Close record details" data-close-modal>×</button>
      <header class="modal-head">
        <div class="modal-overline"><span class="modal-category">${escapeHTML(record.artist)}</span><span class="modal-position">${activeIndex >= 0 ? `${activeIndex + 1} of ${modalRecords.length}` : "Archive detail"}</span></div>
        <h2 class="modal-title" id="modal-record-title">${escapeHTML(displayTitle(record))}</h2>
        <p class="modal-edition">${escapeHTML(record.edition)}</p>
        ${modalTags.length ? `<div class="modal-badges">${modalTags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}</div>` : ""}
      </header>
      <div class="modal-visual">
        <div class="modal-image-frame">
          <span class="modal-fallback">${escapeHTML(displayTitle(record))}</span>
          ${gallery[0] ? `<img class="modal-image" data-gallery-image src="${escapeAttr(gallery[0])}" alt="${escapeAttr(`${displayTitle(record)} — exact pressing product image`)}">` : "<span class=\"modal-no-photo\">No pressing image documented</span>"}
          ${gallery.length > 1 ? `<div class="modal-gallery-controls"><span data-gallery-count>Pressing photo · 1 of ${gallery.length}</span><div><button type="button" data-gallery-prev aria-label="Previous pressing photo">‹</button><button type="button" data-gallery-next aria-label="Next pressing photo">›</button></div></div>` : ""}
        </div>
      </div>
      <div class="modal-body">
        <div class="modal-price-row">
          <span class="modal-price-label">${record.wishlist ? "Wishlist status" : record.setup ? "Target price" : "Amount paid"}</span>
          <strong class="modal-price">${escapeHTML(displayPriceText(record))}</strong>
        </div>
        ${facts.length ? `<dl class="modal-specs">${facts.map((fact) => `
          <div><dt>${escapeHTML(fact.label)}</dt><dd>${escapeHTML(fact.value)}</dd></div>
        `).join("")}</dl>` : ""}
        ${!record.wishlist && !record.setup ? `<section class="modal-listening"><div class="modal-listening-disc${previewRecordId === record.id && previewAudio && !previewAudio.paused ? " is-playing" : ""}" data-preview-disc="${escapeAttr(record.id)}" aria-hidden="true">${discMarkup(record, "pressing-disc pressing-disc--listening")}</div>${previewControlMarkup(record, "modal")}</section>` : ""}
        ${record.journal ? `<section class="collection-story"><span>My copy · ${escapeHTML(record.journal.date.replace(" · date not recorded", ""))}</span><h3>${escapeHTML(record.journal.place)}</h3><p>${escapeHTML(record.journal.note)}</p></section>` : ""}
        ${record.description ? `<section class="modal-notes"><span>${escapeHTML(notesHeading)}</span><p class="modal-description">${escapeHTML(record.description)}</p></section>` : ""}
        ${archiveRows.length ? `<details class="archive-record-details"><summary>Archive record <span>pressing facts & provenance</span></summary><dl>${archiveRows.map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join("")}</dl></details>` : ""}
        ${marketMarkup}
        ${links.length || !record.wishlist ? `<div class="modal-links">${links.join("")}<button type="button" class="modal-link" data-share-record="${escapeAttr(record.id)}">Share record ↗</button></div>` : ""}
        <div class="modal-navigation">
          <button class="modal-nav-button modal-nav-button--previous" type="button" data-modal-direction="previous" ${previousRecord ? "" : "disabled"}><small>Previous</small><span>${previousRecord ? escapeHTML(displayTitle(previousRecord)) : "Start of list"}</span></button>
          <button class="modal-nav-button modal-nav-button--next" type="button" data-modal-direction="next" ${nextRecord ? "" : "disabled"}><small>Next</small><span>${nextRecord ? escapeHTML(displayTitle(nextRecord)) : "End of list"}</span></button>
        </div>
      </div>
    `;

    updateTotalPrivacy();

    modalNode.hidden = false;
    modalNode.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    try { history.replaceState({ archiveRoute: state.page, format: state.formatFilter }, "", `${location.pathname}${location.search}#record=${encodeURIComponent(record.id)}`); } catch (_) {}
    modalPanel.querySelector(".modal-close")?.focus({ preventScroll: true });

    modalPanel.querySelector(".modal-image")?.addEventListener("error", (event) => {
      event.currentTarget.closest(".modal-visual")?.classList.add("is-missing");
    }, { once: true });
    const setGalleryImage = (offset) => {
      if (gallery.length < 2) return;
      galleryIndex = (galleryIndex + offset + gallery.length) % gallery.length;
      const image = modalPanel.querySelector("[data-gallery-image]");
      if (image) {
        image.src = gallery[galleryIndex];
        image.alt = `${displayTitle(record)} — documented pressing photo ${galleryIndex + 1}`;
      }
      const count = modalPanel.querySelector("[data-gallery-count]");
      if (count) count.textContent = `Pressing photo · ${galleryIndex + 1} of ${gallery.length}`;
    };
    modalPanel.querySelector("[data-gallery-prev]")?.addEventListener("click", (event) => { event.stopPropagation(); setGalleryImage(-1); });
    modalPanel.querySelector("[data-gallery-next]")?.addEventListener("click", (event) => { event.stopPropagation(); setGalleryImage(1); });
    const galleryFrame = modalPanel.querySelector(".modal-image-frame");
    let touchStartX = null;
    galleryFrame?.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0]?.clientX ?? null; }, { passive: true });
    galleryFrame?.addEventListener("touchend", (event) => {
      const endX = event.changedTouches[0]?.clientX;
      if (touchStartX == null || endX == null || gallery.length < 2) return;
      const delta = endX - touchStartX;
      if (Math.abs(delta) > 45) setGalleryImage(delta < 0 ? 1 : -1);
      touchStartX = null;
    }, { passive: true });
    modalPanel.querySelector("[data-share-record]")?.addEventListener("click", () => shareRecord(record));
    modalPanel.querySelector("[data-preview-toggle]")?.addEventListener("click", (event) => {
      event.preventDefault();
      togglePreview(event.currentTarget.dataset.recordId);
    });
    modalPanel.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
    modalPanel.querySelectorAll("[data-modal-direction]").forEach((button) => {
      button.addEventListener("click", () => {
        const offset = button.dataset.modalDirection === "next" ? 1 : -1;
        const nextRecord = modalRecords[activeIndex + offset];
        if (nextRecord) openRecord(nextRecord.id);
      });
    });
  }

  function closeModal() {
    modalNode.hidden = true;
    modalNode.setAttribute("aria-hidden", "true");
    modalPanel.innerHTML = "";
    document.body.classList.remove("modal-open");
    if (location.hash.startsWith("#record=")) {
      try { history.replaceState({ archiveRoute: state.page, format: state.formatFilter }, "", `${location.pathname}${location.search}${routeHash(state.page, state.formatFilter)}`); } catch (_) {}
    }
    state.activeId = null;
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus({ preventScroll: true });
  }

  async function shareRecord(record) {
    const url = new URL(location.href);
    url.hash = `record=${encodeURIComponent(record.id)}`;
    const shareData = { title: `${displayTitle(record)} · Jay’s Vinyl Collection`, text: `${record.artist} — ${record.edition}`, url: url.toString() };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString());
        showArchiveToast("Share link copied");
      } else showArchiveToast("Use the page address to share this record");
    } catch (error) {
      if (error?.name !== "AbortError") showArchiveToast("Couldn’t open sharing on this device");
    }
  }

  function showArchiveToast(message) {
    let toast = document.querySelector(".archive-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "archive-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showArchiveToast.timer);
    showArchiveToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  modalNode.querySelector(".modal-backdrop")?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (event) => {
    if (modalNode.hidden) return;
    if (event.key === "Escape") closeModal();
    trapFocus(modalPanel, event);
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const direction = event.key === "ArrowRight" ? "next" : "previous";
      modalPanel.querySelector(`[data-modal-direction="${direction}"]:not(:disabled)`)?.click();
    }
  });

  searchNode.addEventListener("input", () => {
    state.query = searchNode.value.toLowerCase().trim();
    renderCollection();
  });
  sortNode.addEventListener("change", () => {
    state.sort = sortNode.value;
    renderCollection();
  });
  document.querySelector("[data-scroll-collection]")?.addEventListener("click", () => navigatePage("collection"));
  document.querySelectorAll("[data-view-button]").forEach((button) => {
    button.addEventListener("click", () => navigatePage(button.dataset.viewButton));
  });
  document.querySelector("[data-page-back]")?.addEventListener("click", (event) => navigatePage(event.currentTarget.dataset.backTarget, { replace: true }));
  document.querySelector("[data-surprise]")?.addEventListener("click", () => {
    const pool = state.view === "collection" ? allRecords : state.view === "wishlist" ? wishlistRecords : setupItems;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) openRecord(pick.id);
  });
  document.querySelectorAll("[data-layout]").forEach((button) => {
    button.addEventListener("click", () => {
      state.layout = button.dataset.layout;
      if (state.view === "collection") {
        state.collectionMode = button.dataset.layout;
        state.activeFamilyKey = "";
      }
      document.querySelectorAll("[data-layout]").forEach((option) => option.setAttribute("aria-pressed", String(option.dataset.layout === state.layout)));
      renderCollection();
    });
  });

  document.querySelector("[data-theme-toggle]")?.addEventListener("click", (event) => {
    const app = document.querySelector(".archive-app");
    darkRoom = !darkRoom;
    app.classList.toggle("is-room", darkRoom);
    const button = event.currentTarget;
    button.setAttribute("aria-pressed", String(darkRoom));
    button.setAttribute("aria-label", darkRoom ? "Switch to day mode" : "Switch to night mode");
    button.innerHTML = `${darkRoom ? "☼" : "◐"}<span>${darkRoom ? "Day mode" : "Night mode"}</span>`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", darkRoom ? "#15110f" : "#f4f5f2");
    try { localStorage.setItem("jay-vinyl-dark-room", String(darkRoom)); } catch (_) {}
  });
  document.querySelector("[data-now-spinning-open]")?.addEventListener("click", (event) => {
    const id = event.currentTarget.dataset.recordId;
    if (id) openRecord(id);
    else {
      navigatePage("collection");
      document.querySelector(".archive-search")?.focus({ preventScroll: true });
    }
  });
  document.querySelector("[data-now-spinning-close]")?.addEventListener("click", () => {
    nowSpinningDismissed = true;
    try { sessionStorage.setItem(nowSpinningDismissedKey, "true"); } catch (_) {}
    document.querySelector(".now-spinning-bar")?.setAttribute("hidden", "");
  });

  const homeVault = document.querySelector(".archive-home-vault");
  homeVault?.addEventListener("click", (event) => {
    const previewButton = event.target.closest("[data-preview-toggle]");
    if (previewButton) {
      event.preventDefault();
      togglePreview(previewButton.dataset.recordId);
      return;
    }
    const recordButton = event.target.closest("[data-record-id]");
    if (recordButton) openRecord(recordButton.dataset.recordId);
  });
  homeVault?.addEventListener("change", (event) => {
    const select = event.target.closest("[data-now-spinning-select]");
    if (!select) return;
    if (previewAudio && previewRecordId !== select.value) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      previewState = "idle";
      previewRecordId = "";
    }
    setNowSpinning(select.value);
  });

  const initialRoute = parseRoute();
  if (!history.state?.archiveRoute) {
    if (location.hash && (initialRoute.page !== "home" || initialRoute.recordId)) {
      const requestedHash = location.hash;
      history.replaceState({ archiveRoute: "home" }, "", `${location.pathname}${location.search}`);
      history.pushState({ archiveRoute: initialRoute.page, format: initialRoute.format || "all" }, "", `${location.pathname}${location.search}${requestedHash}`);
    } else {
      history.replaceState({ archiveRoute: "home" }, "", `${location.pathname}${location.search}`);
    }
  }
  window.addEventListener("popstate", () => {
    const route = parseRoute();
    applyRoute(route, { shouldScroll: true });
    if (route.recordId && allRecords.concat(wishlistRecords, setupItems).some((record) => record.id === route.recordId)) openRecord(route.recordId);
  });
  applyRoute(initialRoute, { shouldScroll: false });
  if (initialRoute.recordId && allRecords.concat(wishlistRecords, setupItems).some((record) => record.id === initialRoute.recordId)) openRecord(initialRoute.recordId);
})();
