import BrandMark from './BrandMark';

/**
 * A capa do talão: a folha carbonada de baixo, onde o desenho técnico da rede
 * é impresso. É a segunda folha do formulário — por isso o azul de via.
 */
export default function LoginCover() {
  return (
    <div className="hidden flex-col justify-between bg-carbon px-10 py-9 text-paper md:flex">
      <div className="flex items-center gap-2.5">
        <BrandMark className="h-7 w-7 text-paper" />
        <span className="text-lg font-bold uppercase tracking-[0.2em]">ISP Inventory</span>
      </div>

      <div className="grid flex-1 place-items-center py-8">
        <svg
          viewBox="0 0 240 160"
          className="w-full max-w-[34rem] text-paper"
          fill="none"
          stroke="currentColor"
          role="img"
          aria-label="Desenho técnico de uma rede de fibra: poste, cabo de drop até a casa com o equipamento na parede, trena em metros e etiqueta de patrimônio"
        >
          <g strokeWidth="1.25" vectorEffect="non-scaling-stroke" opacity="0.92">
            {/* poste, braco e isoladores */}
            <path d="M24 148V16" />
            <path d="M10 26h28" />
            <path d="M16 26v6M24 26v6M32 26v6" opacity="0.55" />

            {/* cabo de drop: sai do poste e assenta no beiral da casa */}
            <path d="M32 26C40 80 84 104 148 104" />

            {/* casa com o equipamento na parede */}
            <path d="M148 148v-44l32-28 32 28v44" />
            <path d="M168 148v-28h16v28" />
            <rect x="196" y="110" width="17" height="11" />
            <circle cx="204.5" cy="115.5" r="1.5" fill="currentColor" />

            {/* trena: o insumo é contado em metros */}
            <path d="M46 126h86" opacity="0.55" />
            <g opacity="0.55">
              <path d="M52 126v6M60 126v9M68 126v6M76 126v9M84 126v6M92 126v9M100 126v6M108 126v9M116 126v6M124 126v9" />
            </g>

            {/* etiqueta de patrimônio: o item é rastreado por número */}
            <path d="M170 22h62v24l-9 9h-53z" />
            <circle cx="180" cy="34" r="3" />
            <path d="M192 34h30" strokeDasharray="4 4" opacity="0.6" />
          </g>
        </svg>
      </div>

      <div>
        <p className="max-w-[30rem] text-sm leading-relaxed">
          Estoque e rastreio de material do almoxarifado central ao carro do técnico. Toda entrada,
          transferência, baixa e devolução deixa via registrada.
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-1.5 text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
          <li>Administrador</li>
          <li>Estoquista</li>
          <li>Técnico</li>
        </ul>
      </div>
    </div>
  );
}
