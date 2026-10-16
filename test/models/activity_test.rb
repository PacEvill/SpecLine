require "test_helper"

class ActivityTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end

  test "formatted_message deve escapar metadados do usuário" do
    activity = Activity.new(
      user: users(:one),
      workspace: workspaces(:one),
      trackable: projects(:one),
      action: "issue_created",
      metadata: { "identifier" => "PROJ-9", "title" => %(x"><img src=x onerror="alert(1)">) }
    )
    message = activity.formatted_message
    assert_not_includes message, "<img"
    assert_includes message, "&lt;img"
  end

  test "status_changed escapa nomes de coluna" do
    activity = Activity.new(
      user: users(:one),
      workspace: workspaces(:one),
      trackable: issues(:one),
      action: "status_changed",
      metadata: { "from" => %(To Do<script>), "to" => %(Done<b>) }
    )
    assert_not_includes activity.formatted_message, "<script>"
    assert_not_includes activity.formatted_message, "<b>"
  end
end