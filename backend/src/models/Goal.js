const mongoose = require('mongoose');

const GOAL_CATEGORIES = [
  'Programming',
  'Web Development',
  'Computer Science',
  'Communication',
  'Other',
];

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: GOAL_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
      default: 'Other',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    targetDate: {
      type: Date,
      required: [true, 'Target completion date is required'],
      validate: {
        validator: function (value) {
          // targetDate must be greater than or equal to startDate
          return !this.startDate || value >= this.startDate;
        },
        message: 'Target date must be on or after start date',
      },
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries by user and status
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, category: 1 });

const Goal = mongoose.model('Goal', goalSchema);

module.exports = {
  Goal,
  GOAL_CATEGORIES,
};
