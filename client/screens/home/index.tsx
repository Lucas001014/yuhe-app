import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { HotDiscussionTab } from './tabs/HotDiscussionTab';
import { BountyTab } from './tabs/BountyTab';

const initialLayout = { width: Dimensions.get('window').width };

export default function HomeScreen() {
  const { theme } = useTheme();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'hot', title: '热点讨论' },
    { key: 'bounty', title: '悬赏' },
  ]);

  const renderScene = SceneMap({
    hot: HotDiscussionTab,
    bounty: BountyTab,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.primary, height: 2 }}
      style={{
        backgroundColor: theme.backgroundRoot,
        borderBottomWidth: 1,
        borderBottomColor: theme.borderLight,
      }}
      activeColor={theme.primary}
      inactiveColor={theme.textSecondary}
      tabStyle={{ width: 'auto' }}
      scrollEnabled={false}
      labelStyle={{
        fontSize: 16,
        fontWeight: '600',
        textTransform: 'none',
      }}
    />
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        lazy
      />
    </Screen>
  );
}
