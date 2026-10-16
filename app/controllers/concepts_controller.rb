class ConceptsController < ApplicationController
  # Preview isolado de concepts — SOMENTE desenvolvimento.
  # Não usa banco, não altera /workspaces real.
  before_action :ensure_development!

  def workspaces
    render_concept("docs/design_concepts/workspaces_concept.html")
  end

  def menu
    render_concept("docs/design_concepts/menu_principal_concept.html")
  end

  private

  # Injeta o caminho digerido do application.css (Propshaft) no placeholder
  # /assets/application.css, mantendo o arquivo em docs/ como fonte única.
  def render_concept(relative_path)
    html = Rails.root.join(relative_path).read
    html = html.gsub("/assets/application.css", ActionController::Base.helpers.asset_path("application.css"))
    render html: html.html_safe, layout: false
  end

  def ensure_development!
    head :not_found unless Rails.env.development?
  end
end
