---
title: Stop Launching. Start Rolling Out.
description: Optimizely blog post introducing Optimizely Rollouts, May 22, 2019.
url: https://www.davidisquick.com/stop_launching_start_rolling_out.pdf
---

# Stop Launching. Start Rolling Out.

_Dan Siroker · May 22, 2019 · Optimizely blog_

_Work sample from [David Isquick's portfolio](../optimizely.md). Text transcribed from the [original PDF](https://www.davidisquick.com/stop_launching_start_rolling_out.pdf); images are described in brackets._

Splashy, big-bang launches were once the most common way software companies released new software. Product and engineering worked tirelessly to get a new product or feature ready while marketing and PR feverishly prepped launch materials. They often even put together extravagant launch parties to celebrate the occasion.

But for every successful big bang launch, there were many failed launches that either never gained traction or that were so harmful, they actually caused successful companies to stumble or crash.

## Avoiding the temptation of the splashy launch

Launching a new feature is a risky proposition. Even the most well designed and researched features can have unforeseen consequences. Perhaps the poster child of a big bang launch gone awry is Digg, the social news site that by 2008 boasted an estimated 236M visitors to its homepage per year.

_[Image: PCWorld article posted seven days after Digg launched v4 of their site.]_

In 2010, Digg decided to go all-in on a version 4 redesign of their site. Instead of gradually shifting traffic to the new experience, they reprovisioned their servers to run the redesigned site code. This decision resulted in two catastrophic things happening at once. First, the new version of the site was buggy, and since their engineers had reprovisioned their servers, they couldn’t roll back. Second, the new version of the site angered their user base, who felt betrayed by the changes to the site. Digg saw a drop of 33% in active users overnight, and within a few weeks they were overtaken by their top competitor, Reddit.

_[Image: Reddit vs. Digg: Google Trends May 2010–May 2012.]_

By May 2012, Digg sold for $500,000 after being previously valued at $160M. Reddit has now grown to be the 5th most visited website in the United States and 20th most visited in the world.

## Ship faster with less risk

The smartest companies know that launching your product to everyone can be a recipe for disaster. They embrace rollouts as a way to release products faster with less risk. Companies like Instagram don’t launch new features to everyone at once. Instead they gradually roll out over a few weeks to validate a feature’s performance and customer experience.

_[Image: SearchEngineJournal article on Instagram rolling out new user profiles.]_

These companies use feature flags in order to control who gets access to their features.

_[Image: Feature flags are on/off switches for your features.]_

With feature flags, you can roll out to a small percentage of users to reduce risk and fail faster. If you detect errors, performance spikes, or user backlash, just turn off the problematic feature using the flag – no code deploy necessary. With feature flags, you can avoid messy rollbacks and hotfixes since each feature flag acts as an on/off switch for an individual feature.

_[Image: Rolling out a feature to 25% of users.]_

Instead of launching to everyone, Digg could have used a feature flag to release their redesigned site to 1% of their users. They would have seen the backlash to the new design and been able to roll it back. Also, by launching to just 1% of their users, they would have only alienated that small percentage instead of their entire user base.

## Introducing Optimizely Rollouts: A free, safe way to roll out new features

We believe that every team should be able to release products quickly and safely and so today, we’re rolling out Optimizely Rollouts.

Optimizely Rollouts comes with unlimited feature flags and seats. It includes a cloud-based interface integrated with Jira to help you quickly release features and collaborate across teams. With Rollouts, you can innovate faster by validating features with a percentage of your users or key segments before rolling out to everyone. You can also free up engineering time by allowing product managers to grant access to features to early access or beta customers.

_[Image: Rolling out a feature to only beta testers and internal team.]_

## Why we built Optimizely Rollouts

Optimizely started in 2010 as a website A/B testing tool with the goal to make it absurdly simple to run A/B tests. Since then, we’ve been on a mission to democratize the scientific method and enable every business to build a culture of experimentation. Today, we are the #1 Experimentation Platform in the world.

We initially focused on serving marketing teams in order to help marketers undergo a transformation from Mad Men to Math Men. Now, a similar transformation is happening in product development. In the past, software companies launched new features without any regard for customer validation. Today, the best software companies consider each feature they build as a hypothesis that needs to be tested in the real world in front of customers.

That’s why we built Optimizely Rollouts. We believe that rolling out features is an essential step on the journey to building a culture of experimentation in product development.

## Why Optimizely Rollouts is free

Building a culture of experimentation in product development is hard. Our ambition is to make it easy. It can be an uphill battle to change an organization’s culture, especially if it costs a lot of money upfront. That’s why we’re making Optimizely Rollouts free (unlike other solutions in the market, like LaunchDarkly). Because we believe rolling out features is just a step on the journey to experiment-driven product development, we want to help every company work this way. As companies mature, the next step on the journey is embracing A/B testing as part of the process of rolling out features. We’ve built Rollouts on top of our paid platform, Optimizely Full Stack, so you can do just that.

## Get started

Create your account today to start releasing products with less risk and more confidence. If you are an existing Optimizely Web customer, you can add Rollouts to your existing account.

Join our webinar, “This launch will self-destruct in 3…2…1” on June 27th, to learn how you can use feature rollouts and experimentation to avoid disastrous launches.
