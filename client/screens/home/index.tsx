import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { NormalTab } from './tabs/NormalTab';
import { PaidQATab } from './tabs/PaidQATab';
import { BountyTab } from './tabs/BountyTab';
import { ProductTab } from './tabs/ProductTab';

const initialLayout = { width: Dimensions.get('window').width };

export default function HomeScreen() {
  const { theme } = useTheme();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'normal', title: '推荐' },
    { key: 'paid_qa', title: '知识库' },
    { key: 'bounty', title: '悬赏' },
    { key: 'product', title: '热点讨论' },
  ]);

  const renderScene = SceneMap({
    normal: NormalTab,
    paid_qa: PaidQATab,
    bounty: BountyTab,
    product: ProductTab,
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
      scrollEnabled={true}
      labelStyle={{
        fontSize: 15,
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
