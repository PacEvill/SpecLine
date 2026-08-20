module DocumentsHelper
  # Renderiza o ícone perfeito de documento ou pasta alinhado à estética SpecLine
  def document_icon_tag(document_or_icon, is_folder: nil, size_class: "w-4 h-4", extra_class: "")
    doc = document_or_icon.is_a?(Document) ? document_or_icon : nil
    icon_str = doc ? doc.icon.to_s.strip : document_or_icon.to_s.strip
    folder = is_folder.nil? ? (doc&.is_folder? || false) : is_folder

    if folder
      folder_icon_svg(classes: "#{size_class} text-amber-500 dark:text-amber-400 shrink-0 #{extra_class}")
    elsif is_custom_emoji?(icon_str)
      %(<span class="inline-flex items-center justify-center leading-none select-none #{size_class} #{extra_class}">#{ERB::Util.html_escape(icon_str)}</span>).html_safe
    else
      file_icon_svg(classes: "#{size_class} text-terracotta/90 dark:text-terracotta/90 shrink-0 #{extra_class}")
    end
  end

  def folder_icon_svg(classes: "w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0", filled: false)
    if filled
      %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="#{classes}"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>).html_safe
    else
      %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="#{classes}"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>).html_safe
    end
  end

  def file_icon_svg(classes: "w-4 h-4 text-ink-light/70 dark:text-white/60 shrink-0")
    %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="#{classes}"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>).html_safe
  end

  def move_icon_svg(classes: "w-4 h-4 text-current shrink-0")
    %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="#{classes}"><path d="M2 12h20"/><path d="m17 7 5 5-5 5"/><path d="m7 17-5-5 5-5"/></svg>).html_safe
  end

  def folder_move_icon_svg(classes: "w-4 h-4 text-current shrink-0")
    %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="#{classes}"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><polyline points="12 11 16 15 12 19"/><line x1="8" y1="15" x2="16" y2="15"/></svg>).html_safe
  end

  def document_icon_svg(icon_id, classes = "")
    document_icon_tag(icon_id, extra_class: classes)
  end

  private

  def is_custom_emoji?(str)
    return false if str.blank?
    # Se for emoji padrão ("📄" ou "📁") ou texto simples comum, tratamos como ícone vetorial do sistema
    return false if %w[📄 📁 file-text folder document].include?(str)
    # Verifica se contém caracteres não-ASCII (típico de emojis)
    str.match?(/[^\x00-\x7F]/)
  end
end
