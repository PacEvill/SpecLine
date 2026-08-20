module WhiteboardsHelper
  def whiteboard_icon_tag(whiteboard_or_icon, size_class: "w-5 h-5", extra_class: "")
    wb = whiteboard_or_icon.is_a?(Whiteboard) ? whiteboard_or_icon : nil
    icon_name = wb ? wb.icon.to_s.strip : whiteboard_or_icon.to_s.strip

    case icon_name
    when "architecture", "system", "🏛️"
      architecture_icon_svg(classes: "#{size_class} #{extra_class}")
    when "sequence", "flow", "auth", "🔄"
      sequence_icon_svg(classes: "#{size_class} #{extra_class}")
    when "brainstorm", "idea", "💡"
      brainstorm_icon_svg(classes: "#{size_class} #{extra_class}")
    when "er_diagram", "database", "data", "🗄️"
      database_icon_svg(classes: "#{size_class} #{extra_class}")
    when "mermaid", "code"
      code_diagram_icon_svg(classes: "#{size_class} #{extra_class}")
    when "whiteboard", "canvas", "draw"
      canvas_icon_svg(classes: "#{size_class} #{extra_class}")
    else
      default_whiteboard_icon_svg(classes: "#{size_class} #{extra_class}")
    end
  end

  def whiteboard_mode_icon_tag(mode, size_class: "w-4 h-4", extra_class: "")
    case mode.to_s
    when "mermaid"
      code_diagram_icon_svg(classes: "#{size_class} #{extra_class}")
    when "whiteboard"
      canvas_icon_svg(classes: "#{size_class} #{extra_class}")
    else # hybrid
      hybrid_icon_svg(classes: "#{size_class} #{extra_class}")
    end
  end

  def default_whiteboard_icon_svg(classes: "w-5 h-5 text-terracotta shrink-0")
    %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="#{classes}"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 9 6 6m0-6-6 6"/><circle cx="12" cy="12" r="9"/></svg>).html_safe
  end

  def architecture_icon_svg(classes: "w-5 h-5 text-blue-500 shrink-0")
    %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="#{classes}"><rect width="8" height="8" x="2" y="2" rx="2"/><rect width="8" height="8" x="14" y="2" rx="2"/><rect width="8" height="8" x="8" y="14" rx="2"/><path d="M6 10v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2"/><path d="M12 12v2"/></svg>).html_safe
  end

  def sequence_icon_svg(classes: "w-5 h-5 text-emerald-500 shrink-0")
    %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="#{classes}"><path d="M8 3v18"/><path d="M16 3v18"/><path d="m8 7 8 0"/><path d="m16 12-8 0"/><path d="m8 17 8 0"/><polyline points="13 4 16 7 13 10"/><polyline points="11 9 8 12 11 15"/><polyline points="13 14 16 17 13 20"/></svg>).html_safe
  end

  def brainstorm_icon_svg(classes: "w-5 h-5 text-amber-500 shrink-0")
    %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="#{classes}"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>).html_safe
  end

  def database_icon_svg(classes: "w-5 h-5 text-indigo-500 shrink-0")
    %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="#{classes}"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>).html_safe
  end
  alias_method :er_diagram_icon_svg, :database_icon_svg

  def code_diagram_icon_svg(classes: "w-5 h-5 text-emerald-500 shrink-0")
    %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="#{classes}"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>).html_safe
  end

  def canvas_icon_svg(classes: "w-5 h-5 text-amber-500 shrink-0")
    %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="#{classes}"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>).html_safe
  end

  def hybrid_icon_svg(classes: "w-5 h-5 text-blue-500 shrink-0")
    %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="#{classes}"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>).html_safe
  end
end
