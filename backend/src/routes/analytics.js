'use strict';

const express = require('express');
const Analytics = require('../models/Analytics');

const router = express.Router();

// Track page view
router.post('/track-view', async (req, res) => {
  try {
    const { page = 'landing' } = req.body;

    const [record, created] = await Analytics.findOrCreate({
      where: { page, event_type: 'page_view' },
      defaults: { view_count: 1 },
    });

    if (!created) {
      await record.increment('view_count', { by: 1 });
      await record.reload();
    }

    res.json({ success: true, totalViews: record.view_count });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, error: 'Failed to track view' });
  }
});

// Get page views
router.get('/views/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const record = await Analytics.findOne({
      where: { page, event_type: 'page_view' },
    });
    res.json({ success: true, totalViews: record?.view_count || 0 });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get views' });
  }
});

module.exports = router;
