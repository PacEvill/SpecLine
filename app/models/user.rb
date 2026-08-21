require "open-uri"

class User < ApplicationRecord
  include SecureAttachable

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [ :google_oauth2 ]

  has_many :workspaces, dependent: :destroy
  has_many :created_issues, class_name: "Issue", foreign_key: :creator_id, dependent: :nullify
  has_many :assigned_issues, class_name: "Issue", foreign_key: :assignee_id, dependent: :nullify
  has_many :comments, dependent: :destroy
  has_many :activities, dependent: :destroy
  has_many :documents, foreign_key: :author_id, dependent: :nullify
  has_many :whiteboards, dependent: :destroy

  has_one_attached :avatar
  validate :validate_avatar_attachment

  private

  def validate_avatar_attachment
    validate_secure_attachment(:avatar)
  end

  public

  def full_name
    return email.split("@").first.capitalize if first_name.blank? && last_name.blank?
    [ first_name, last_name ].compact.join(" ").strip
  end

  def self.from_omniauth(auth)
    # 1. Tenta achar o usuário pelo Google UID
    user = where(provider: auth.provider, uid: auth.uid).first

    unless user
      # 2. Se não achou, busca pelo e-mail
      user = find_by(email: auth.info.email)

      if user
        # 3. Conta já existe por E-mail. Linkamos o Google nela.
        user.update(provider: auth.provider, uid: auth.uid)
      else
        # 4. Conta não existe. Criamos uma nova.
        user = create do |u|
          u.provider = auth.provider
          u.uid = auth.uid
          u.email = auth.info.email
          u.password = Devise.friendly_token[0, 20]
          u.first_name = auth.info.first_name.presence || auth.info.name&.split(" ")&.first || "Usuário"
          u.last_name = auth.info.last_name.presence || auth.info.name&.split(" ")&.drop(1)&.join(" ")
        end
      end
    end

    # 5. Se o Google enviou uma foto de perfil e o usuário não tem uma, anexamos de forma segura
    if auth.info.image.present? && !user.avatar.attached?
      begin
        downloaded_image = URI.open(auth.info.image)
        user.avatar.attach(io: downloaded_image, filename: "google_avatar_#{user.id}.jpg")
      rescue StandardError => e
        Rails.logger.error "[OmniAuth] Erro ao baixar avatar do Google: #{e.message}"
      end
    end

    user
  end
end
