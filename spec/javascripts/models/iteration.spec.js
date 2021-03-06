describe("iteration", function() {

  beforeEach(function() {
    this.iteration = new Iteration();
  });

  describe("initialize", function() {

    it("should assign stories if passed", function() {
      var stories = [1,2,3];
      var iteration = new Iteration({'stories': stories});
      expect(iteration.get('stories')).toEqual(stories);
    });

  });

  describe("defaults", function() {

    it("should have an empty array of stories", function() {
      expect(this.iteration.get('stories')).toEqual([]);
    });

  });

  describe("points", function() {

    beforeEach(function() {
      var Story = Backbone.Model.extend({name: 'story'});
      this.stories = [
        new Story({estimate: 2, story_type: 'feature'}),
        new Story({estimate: 3, story_type: 'feature'}),
        new Story({estimate: 3, story_type: 'bug'}) // Only features count
                                                    // towards velocity
      ];
      this.iteration.set({stories: this.stories});
    });

    it("should calculate its points", function() {
      expect(this.iteration.points()).toEqual(5);
    });

    it("should return 0 for points if it has no stories", function() {
      this.iteration.unset('stories');
      expect(this.iteration.points()).toEqual(0);
    });

  });

  describe("filling backlog iterations", function() {

    it("should return how many points are available", function() {
      var pointsStub = sinon.stub(this.iteration, "points");
      pointsStub.returns(3);

      this.iteration.set({'maximum_points': 5});
      expect(this.iteration.availablePoints()).toEqual(2);
    });

    it("should always accept chores bugs and releases", function() {
      var stub = sinon.stub();
      var story = {get: stub};

      stub.withArgs('story_type').returns('chore');
      expect(this.iteration.canTakeStory(story)).toBeTruthy();
      stub.withArgs('story_type').returns('bug');
      expect(this.iteration.canTakeStory(story)).toBeTruthy();
      stub.withArgs('story_type').returns('release');
      expect(this.iteration.canTakeStory(story)).toBeTruthy();
    });

    it("should accept a feature if there are enough free points", function() {
      var availablePointsStub = sinon.stub(this.iteration, "availablePoints");
      availablePointsStub.returns(3);

      var stub = sinon.stub();
      var story = {get: stub};

      stub.withArgs('story_type').returns('feature');
      stub.withArgs('estimate').returns(3);

      expect(this.iteration.canTakeStory(story)).toBeTruthy();

      // Story is too big to fit in iteration
      stub.withArgs('estimate').returns(4);
      expect(this.iteration.canTakeStory(story)).toBeFalsy();
    });

  });

});
