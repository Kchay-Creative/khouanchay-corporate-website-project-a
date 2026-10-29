import type { BrandCatalog } from "./types";

export function createInitialBrandCatalog(): BrandCatalog {
  return {
    schemaVersion: 1,
    contentRevision: 0,
    brands: Array.from({ length: 7 }, (_, index) => {
      const number = String(index + 1).padStart(2, "0");
      return {
        id: `demo-brand-${number}`,
        name: {
          lo: `ແບຣນຄູ່ຮ່ວມຕົວຢ່າງ ${number}`,
          en: `Partner brand placeholder ${number}`,
        },
        description: {
          lo: "ເນື້ອຫາຕົວຢ່າງນີ້ກຽມໄວ້ສຳລັບຂໍ້ມູນແບຣນທີ່ຜ່ານການອະນຸມັດ.",
          en: "This placeholder is ready for approved brand information.",
        },
        logoUrl: null,
        visible: true,
        displayOrder: index,
        products:
          index < 3
            ? [
                {
                  id: `demo-product-${number}`,
                  name: {
                    lo: `ສິນຄ້າຕົວຢ່າງ ${number}`,
                    en: `Product placeholder ${number}`,
                  },
                  description: {
                    lo: "ລາຍລະອຽດສິນຄ້າທີ່ອະນຸມັດຈະຖືກເພີ່ມພາຍຫຼັງ.",
                    en: "Approved product details will be added later.",
                  },
                  category: { lo: "ປະເພດຕົວຢ່າງ", en: "Placeholder category" },
                  imageUrl: null,
                  visible: true,
                  displayOrder: 0,
                },
              ]
            : [],
      };
    }),
  };
}
