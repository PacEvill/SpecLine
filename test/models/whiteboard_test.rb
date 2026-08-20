require "test_helper"

class WhiteboardTest < ActiveSupport::TestCase
  setup do
    @workspace = workspaces(:one)
    @project = projects(:one)
    @user = users(:one)
  end

  test "should be valid with valid attributes" do
    whiteboard = Whiteboard.new(
      title: "Diagrama de Infraestrutura",
      mode: "hybrid",
      workspace: @workspace,
      project: @project,
      user: @user
    )
    assert whiteboard.valid?
  end

  test "should require a title" do
    whiteboard = Whiteboard.new(
      title: "",
      workspace: @workspace,
      project: @project,
      user: @user
    )
    assert_not whiteboard.valid?
    assert_includes whiteboard.errors[:title], "não pode ficar em branco"
  end

  test "should set default icon, position, and mermaid code" do
    whiteboard = Whiteboard.create!(
      title: "Novo Quadro",
      workspace: @workspace,
      project: @project,
      user: @user
    )
    assert_equal "canvas", whiteboard.icon
    assert_equal 0, whiteboard.position
    assert_equal "hybrid", whiteboard.mode
    assert_includes whiteboard.mermaid_code, "graph TD"
  end

  test "parsed_content returns a hash" do
    whiteboard = Whiteboard.new(content: '{"elements":[{"id":"1","type":"sticky"}]}')
    parsed = whiteboard.parsed_content
    assert_equal 1, parsed["elements"].length
    assert_equal "sticky", parsed["elements"][0]["type"]
  end
end
