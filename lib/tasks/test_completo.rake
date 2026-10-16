namespace :test do
  desc "Suíte completa: testes do default (rápidos) + system com browser headless"
  task completo: [ "test", "test:system" ] do
    puts "Suíte completa verde: default + system."
  end
end
