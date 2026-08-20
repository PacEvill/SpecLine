# frozen_string_literal: true

module SecureAttachable
  extend ActiveSupport::Concern

  ALLOWED_MIME_TYPES = %w[
    image/png
    image/jpeg
    image/jpg
    image/webp
    image/svg+xml
    application/pdf
  ].freeze

  MAX_FILE_SIZE = 5.megabytes

  included do
    def validate_secure_attachment(attachment_field)
      return unless public_send(attachment_field).attached?

      blob = public_send(attachment_field).blob
      return unless blob.present?

      # 1. Strict Size Restriction
      if blob.byte_size > MAX_FILE_SIZE
        errors.add(attachment_field, "o tamanho do arquivo excede o limite máximo permitido de 5MB")
        blob.purge_later if blob.persisted?
        return
      end

      # 2. Magic Byte Inspection (Protection against extension spoofing)
      if blob.service.respond_to?(:download)
        begin
          blob.open do |file|
            detected_type = Marcel::MimeType.for(file, name: blob.filename.to_s)
            
            unless ALLOWED_MIME_TYPES.include?(detected_type)
              errors.add(attachment_field, "contém um formato de arquivo não permitido (#{detected_type})")
              blob.purge_later if blob.persisted?
            end
          end
        rescue StandardError => e
          Rails.logger.warn("[SecureAttachable] Attachment validation notice: #{e.message}")
        end
      end
    end
  end
end
