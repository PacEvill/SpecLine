class PraticaRegistro < ApplicationRecord
  # Registro de interesse recolectado pela página pública da oficina
  # (/praticas-extensionistas) — LGPD: dado mínimo, finalidade única.
  self.table_name = "pratica_registros"

  validates :nome, presence: true, length: { maximum: 80 }
  validates :contato, presence: true, length: { maximum: 120 }
  validates :origem, presence: true
  validates :ideia, length: { maximum: 500 }, allow_nil: true, allow_blank: true
end
