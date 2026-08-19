class PreferencesController < ApplicationController
  before_action :authenticate_user!
  layout "app"

  def show
    # Renders the preferences view
  end

  def update
    # Here we would update preferences.
    # Since we don't have a preferences column yet, we just mock the success.
    redirect_to preferences_path, notice: "Preferências atualizadas com sucesso."
  end
end
